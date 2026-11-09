import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './config'
import { closeModal, openModal } from './modal'

function forms(formSelector, modalTimerId) {
	const form = document.querySelector(formSelector)
	if (!form) return

	const submitBtn = form.querySelector('button[type="submit"]')

	const message = {
		success: 'Thanks for contacting with us',
		failure: 'Something went wrong',
	}

	form.addEventListener('submit', async event => {
		event.preventDefault()

		// Qayta-qayta bosilib, bir nechta xabar ketib qolmasligi uchun
		if (submitBtn.disabled) return
		submitBtn.disabled = true

		const loader = document.createElement('div')
		loader.classList.add('loader')
		loader.style.width = '20px'
		loader.style.height = '20px'
		loader.style.marginTop = '20px'
		form.append(loader)

		const formData = new FormData(form)
		const name = (formData.get('name') || '').trim()
		const phone = (formData.get('phone') || '').trim()

		try {
			const response = await fetch(
				`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						chat_id: TELEGRAM_CHAT_ID,
						text: `Yangi so'rov\nName: ${name}\nPhone: ${phone}`,
					}),
				}
			)

			// Telegram xatoni (400, 401, 403 ...) JSON ichida qaytaradi.
			// fetch bunday holatda ham xato tashlamaydi, shuning uchun o'zimiz tekshiramiz.
			const result = await response.json()
			if (!response.ok || !result.ok) {
				throw new Error(result.description || `HTTP ${response.status}`)
			}

			showStatusMessage(message.success)
			form.reset()
		} catch (error) {
			console.error('Telegramga yuborishda xato:', error.message)
			showStatusMessage(message.failure)
		} finally {
			loader.remove()
			submitBtn.disabled = false
		}
	})

	function showStatusMessage(text) {
		const modalDialog = document.querySelector('.modal__dialog')

		modalDialog.classList.add('hide')
		openModal('.modal__content', '.modal', modalTimerId)

		const statusModal = document.createElement('div')
		statusModal.classList.add('modal__dialog')
		statusModal.innerHTML = `
			<div class="modal__content">
				<div data-modal-close class="modal__close">&times;</div>
				<div class="modal__title">${text}</div>
			</div>
		`

		document.querySelector('.modal').append(statusModal)

		setTimeout(() => {
			statusModal.remove()
			modalDialog.classList.remove('hide')
			closeModal('.modal')
		}, 4000)
	}
}

export default forms
