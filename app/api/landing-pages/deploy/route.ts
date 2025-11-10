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

    // 2. Criar projeto único na Vercel
    const projectName = `lp-${landingPage.slug}`
    
    console.log(`🚀 Deploying ${projectName} to Vercel...`)

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

    // 4. Atualizar banco com URL
    await supabase
      .from('landing_pages')
      .update({
        deploy_url: deployUrl,
        deploy_status: 'published',
        published_at: new Date().toISOString(),
        status: 'published',
      })
      .eq('id', landingPageId)

    return NextResponse.json({
      success: true,
      deployUrl,
      vercelUrl: deployment.url,
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
