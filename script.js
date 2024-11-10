const base_prompt =
// ". В ответах делай текст светлым. Фон, на котором отображается текст: #3b4060. " + 
"Каждый свой ответ форматируй, используя html теги и css стили, но не используй html и ```." +
"Не пиши в ответах фразы по типу 'Да, конечно, я буду использовать' и так далее";
let history = [];
let loading = false;

async function GetAnswer(){
	var prompt_input = document.getElementById("prompt-input");
	var send_btn = document.getElementById("send-btn");
	var prompt = prompt_input.value.replace(/\n/g, '<br/>');
	var gpt_model = "gpt-4o-mini";

	if (prompt == '') return;

	loading = true;
	send_btn.setAttribute("disabled", "");
	prompt_input.setAttribute("disabled", "");
	prompt_input.value = "";

	var msgs_list = document.querySelector("#messages-list");
	msgs_list.innerHTML += `<li class="message user-message">
					<div class="avatar-container">
						<img src="userlogo.jpg" class="avatar">
					</div>
					<div class="text-container">
						<div class="title-container">
							<span>Пользователь</span>
						</div>
						<div class="message-text-container">
							<span>${prompt}</span>
						</div>
					</div>
				</li>`;

	msgs_list.innerHTML += `<li class="message gpt-message">
				<div class="avatar-container">
					<img src="gptlogo.png" class="avatar">
				</div>
				<div class="text-container">
					<div class="title-container">
						<span>ChatGPT</span>
					</div>
					<div class="message-text-container">
						<span class="loading">...</span>
					</div>
				</div>
			</li>`;

	document.querySelector("#footer").scrollIntoView({ block: "end", behavior: "smooth" });

	var msg = {
				role: "user",
				content: prompt + base_prompt
			};
	history.push(msg);

	const request = await fetch('https://free.easychat.work/api/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({  
				model: gpt_model,
				temperature: 0.7,
				presence_penalty: 0,
				messages: history
			})
	});

	const data = await request.json();
	console.log(data);

	send_btn.removeAttribute("disabled");
	prompt_input.removeAttribute("disabled");
	prompt_input.focus();

	var answer = data.choices[0].message;
	history.push(answer);

	var len = msgs_list.childNodes.length;
	msgs_list.removeChild(msgs_list.childNodes[len - 1]);

	msgs_list.innerHTML += `<li class="message gpt-message">
					<div class="avatar-container">
						<img src="gptlogo.png" class="avatar">
					</div>
					<div class="text-container">
						<div class="title-container">
							<span>ChatGPT</span>
						</div>
						<div class="message-text-container">
							<span>${answer.content}</span>
						</div>
					</div>
				</li>`;
	loading = false;

	document.querySelector("#footer").scrollIntoView({ block: "end", behavior: "smooth" });
}

document.addEventListener('keyup', event => {
	if (event.shiftKey && event.code == "Enter")
	{
		document.querySelector("#prompt-input").value += "";
	} else if(event.code == 'Enter' && loading == false)
	{
		GetAnswer();
	}
});