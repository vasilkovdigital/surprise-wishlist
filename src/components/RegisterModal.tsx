import { DATA_TTL_DAYS, REGISTER_URL } from '../lib/config'
import { withUtm } from '../lib/utm'
import { track } from '../state'

/** Периодическое напоминание: данные хранятся DATA_TTL_DAYS дня — зарегистрируйтесь. */
export function RegisterModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet sheet-small" role="dialog" aria-modal="true" aria-label="Регистрация" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body">
          <img src="brand/mark_gift_dark.svg" alt="" width="48" height="48" />
          <h2>Сохраните ваш вишлист</h2>
          <p>
            Без регистрации данные хранятся всего {DATA_TTL_DAYS} дня, потом удаляются. Зарегистрируйтесь на surprise.by
            бесплатно — вишлист останется с вами, а ещё вы будете получать уведомления о новых впечатлениях и
            поздравления с днём рождения.
          </p>
          <a
            className="btn btn-ink full"
            href={withUtm(REGISTER_URL, 'register')}
            target="_blank"
            rel="noopener"
            onClick={() => { track('register_click', { from: 'modal' }); onClose() }}
          >
            Зарегистрироваться бесплатно
          </a>
          <button className="btn btn-ghost" onClick={onClose}>Позже</button>
        </div>
      </div>
    </div>
  )
}
