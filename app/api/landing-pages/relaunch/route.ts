import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { landingPageId, newDeploy } = await req.json()

    if (!landingPageId) {
      return NextResponse.json(
        { error: 'landingPageId é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Buscar landing page
    const { data: landingPage, error: fetchError } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', landingPageId)
      .single()

    if (fetchError || !landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // 2. Verificar se está arquivada
    if (landingPage.status !== 'archived') {
      return NextResponse.json(
        { error: 'Apenas landing pages arquivadas podem ser relançadas' },
        { status: 400 }
      )
    }

    // 3. Opção 1: Reativar deploy existente (recomendado para SEO)
    if (!newDeploy && landingPage.deploy_url) {
      const { error: updateError } = await supabase
        .from('landing_pages')
        .update({
          status: 'published',
          relaunched_at: new Date().toISOString(),
        })
        .eq('id', landingPageId)

      if (updateError) {
        throw updateError
      }

      console.log(`✅ Landing page ${landingPageId} relançada (URL existente)`)

      return NextResponse.json({
        success: true,
        message: 'Landing page relançada com sucesso',
        data: {
          id: landingPageId,
          status: 'published',
          deploy_url: landingPage.deploy_url,
          relaunched_at: new Date().toISOString(),
        }
      })
    }

    // 4. Opção 2: Novo deploy no Vercel
    if (newDeploy) {
      const VERCEL_TOKEN = process.env.VERCEL_TOKEN
      const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

      if (!VERCEL_TOKEN) {
        return NextResponse.json(
          { error: 'VERCEL_TOKEN não configurado' },
          { status: 500 }
        )
      }

      // Deploy no Vercel
      const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `lp-${landingPage.slug}-relaunch`,
          files: [
            {
              file: 'index.html',
              data: landingPage.html_content,
            },
          ],
          projectSettings: {
            framework: null,
          },
          target: 'production',
          ...(VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }),
        }),
      })

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json()
        throw new Error(`Erro no deploy Vercel: ${JSON.stringify(errorData)}`)
      }

      const deployData = await deployResponse.json()
      const newDeployUrl = `https://${deployData.url}`

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('landing_pages')
        .update({
          status: 'published',
          deploy_url: newDeployUrl,
          relaunched_at: new Date().toISOString(),
        })
        .eq('id', landingPageId)

      if (updateError) {
        throw updateError
      }

      console.log(`✅ Landing page ${landingPageId} relançada (novo deploy)`)

      return NextResponse.json({
        success: true,
        message: 'Landing page relançada com novo deploy',
        data: {
          id: landingPageId,
          status: 'published',
          deploy_url: newDeployUrl,
          relaunched_at: new Date().toISOString(),
        }
      })
    }

    // 5. Fallback: sem deploy URL e sem novo deploy
    return NextResponse.json(
      { error: 'Landing page sem deploy_url. Use newDeploy: true para criar novo deploy.' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('❌ Erro ao relançar landing page:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao relançar landing page', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
