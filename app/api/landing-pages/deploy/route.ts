import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

interface DeployRequest {
  landingPageId: string
}

export async function POST(req: NextRequest) {
  try {
    const { landingPageId } = await req.json()

    if (!landingPageId) {
      return NextResponse.json(
        { error: 'Landing page ID é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Buscar landing page
    const { data: landingPage, error: lpError } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', landingPageId)
      .single()

    if (lpError || !landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status para "deploying"
    await supabase
      .from('landing_pages')
      .update({ deploy_status: 'deploying' })
      .eq('id', landingPageId)

    // 2. Criar repositório PRIVADO no GitHub (opcional mas recomendado)
    const githubToken = process.env.GITHUB_TOKEN
    const repoName = `lp-${landingPage.slug}`
    let githubRepoUrl = ''

    if (githubToken) {
      try {
        console.log(`📁 Criando repositório privado no GitHub: ${repoName}`)
        
        const githubResponse = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: repoName,
            description: `Landing Page: ${landingPage.title}`,
            private: true, // PRIVADO!
            auto_init: true,
          }),
        })

        if (githubResponse.ok) {
          const repoData = await githubResponse.json()
          githubRepoUrl = repoData.html_url
          console.log(`✅ Repositório criado: ${githubRepoUrl}`)

          // Criar arquivo index.html no repo
          const contentBase64 = Buffer.from(landingPage.html_content).toString('base64')
          
          await fetch(`https://api.github.com/repos/${repoData.owner.login}/${repoName}/contents/index.html`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: 'Initial commit: Landing page HTML',
              content: contentBase64,
            }),
          })

          console.log('✅ HTML adicionado ao repositório')
        } else {
          console.warn('⚠️ Erro ao criar repositório GitHub (continuando sem ele)')
        }
      } catch (githubError) {
        console.warn('⚠️ GitHub não disponível (continuando sem repositório):', githubError)
      }
    }

    // 3. Criar deployment direto (sem GitHub)
    const vercelToken = process.env.VERCEL_TOKEN
    const vercelTeamId = process.env.VERCEL_TEAM_ID // opcional

    if (!vercelToken) {
      throw new Error('VERCEL_TOKEN não configurado')
    }

    // Criar files para o deploy
    const indexHtml = landingPage.html_content

    // Deploy direto via API (sem Git)
    const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          {
            file: 'index.html',
            data: indexHtml,
          },
          {
            file: 'vercel.json',
            data: JSON.stringify({
              version: 2,
              routes: [
                {
                  src: '/(.*)',
                  dest: '/index.html',
                },
              ],
            }),
          },
        ],
        projectSettings: {
          framework: null,
          buildCommand: null,
          outputDirectory: null,
        },
        target: 'production',
      }),
    })

    if (!deployResponse.ok) {
      const error = await deployResponse.text()
      console.error('❌ Vercel deploy error:', error)
      
      await supabase
        .from('landing_pages')
        .update({ deploy_status: 'failed' })
        .eq('id', landingPageId)

      return NextResponse.json(
        { error: 'Erro ao fazer deploy na Vercel', details: error },
        { status: 500 }
      )
    }

    const deployment = await deployResponse.json()
    const deployUrl = `https://${deployment.url}`

    console.log(`✅ Deployed to: ${deployUrl}`)

    // 4. Atualizar banco com URL e GitHub repo
    await supabase
      .from('landing_pages')
      .update({
        deploy_url: deployUrl,
        deploy_status: 'published',
        github_repo_url: githubRepoUrl || null,
        published_at: new Date().toISOString(),
        status: 'published',
      })
      .eq('id', landingPageId)

    return NextResponse.json({
      success: true,
      deployUrl,
      vercelUrl: deployment.url,
      githubRepoUrl: githubRepoUrl || null,
      inspectorUrl: deployment.inspectorUrl,
    })

  } catch (error: any) {
    console.error('❌ Erro ao fazer deploy:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer deploy', details: error.message },
      { status: 500 }
    )
  }
}
