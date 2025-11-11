/**
 * 📧 Central de Templates de Email
 * 
 * Todos os templates HTML dos emails estão centralizados aqui
 * para facilitar edição e manutenção.
 * 
 * TEMPLATES DISPONÍVEIS:
 * ✅ getWelcomeEmailHTML - Email de boas-vindas (com i18n)
 * ✅ getNewPostEmailHTML - Notificação de novo post (com i18n)
 * ✅ getTranslationNotificationEmailHTML - Notificação de tradução (com i18n)
 * 
 * Como usar:
 * ```typescript
 * import { getWelcomeEmailHTML, getTranslationNotificationEmailHTML } from '@/lib/email-templates'
 * 
 * const html = getWelcomeEmailHTML('João', 'token123', 'pt-BR')
 * const translationHtml = getTranslationNotificationEmailHTML(params...)
 * ```
 */

export { getWelcomeEmailHTML } from './welcome-email'
export { getNewPostEmailHTML } from './new-post-email'
export { getTranslationNotificationEmailHTML } from './translation-notification-email'
