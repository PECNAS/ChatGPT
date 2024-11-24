const base_prompt =
"Каждый свой ответ форматируй, используя html теги и css стили. " +
"НИКОГДА Не пиши ``` и ```html";
let history = [];
let loading = false;
let selectedChat = null;

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

	var chats = JSON.parse(localStorage.getItem("chats"));
	chats[selectedChat]["history"] = history;
	localStorage.chats = JSON.stringify(chats);
}

function showChatsList(chats) {
	console.log(chats);
	var chats_list = document.querySelector("#chats-list");
	chats_list.innerHTML = ""
	chats.forEach((chat) => {
		if (chat["history"].length != 0) {
			var preview = chat["history"][chat["history"].length - 1]["content"];
			preview = preview.slice(0, 50);
		} else var preview = "Новый чат";

		chats_list.innerHTML += `<li class="chat-element">
						<div class="chat-container">
							<span class="remove-chat">Удалить</span>
							<div class="last-message">
								<span>${preview}...</span>
							</div>
							<div class="msgs-count">
								<span>${chat["history"].length} сообщений</span>
							</div>
							<input hidden id="chat-id" value=${chat["id"]}>
						</div>
					</li>`;
	});

	chats_list.querySelectorAll(".chat-element").forEach((el) => {
		el.addEventListener("click", event => showChat(el));
	});

	chats_list.querySelectorAll(".remove-chat").forEach((el) => {
		el.addEventListener("click", event => removeChat(el));
	});
}

function removeChat(chat) {
	var chat_id = chat.parentNode.querySelector("#chat-id").value;
	var chats = JSON.parse(localStorage.getItem("chats"));
	chats.splice(chat_id, 1);

	for (var i = 0; i < chats.length; i++) {
		chats[i]["id"] = i;
	}
	localStorage.setItem("chats", JSON.stringify(chats));

	document.querySelector("#content").setAttribute("hidden", "");
		selectedChat = null;
		showChatsList(
			JSON.parse(
			localStorage.getItem("chats")
			)
		);

}

function showChat(chat, chat_id) {
	if (event.target.innerHTML == "Удалить") return;

	if (chat_id == null) {
		chat_id = chat.querySelector("#chat-id").value;
	}

	var msgs_list = document.querySelector("#messages-list");
	history = JSON.parse(
		localStorage.getItem("chats")
	)[chat_id]["history"];

	selectedChat = chat_id;
	document.querySelector("#messages-list").innerHTML = "";
	document.querySelector("#content").removeAttribute("hidden");

	history.forEach((msg) => {
		var message_text = msg["content"].replace(base_prompt, "");
		if (msg["role"] == "assistant") {
			msgs_list.innerHTML += `<li class="message gpt-message">
					<div class="avatar-container">
						<img src="gptlogo.png" class="avatar">
					</div>
					<div class="text-container">
						<div class="title-container">
							<span>ChatGPT</span>
						</div>
						<div class="message-text-container">
							<span>${message_text}</span>
						</div>
					</div>
				</li>`;
		} else {
			msgs_list.innerHTML += `<li class="message user-message">
				<div class="avatar-container">
					<img src="userlogo.jpg" class="avatar">
				</div>
				<div class="text-container">
					<div class="title-container">
						<span>Пользователь</span>
					</div>
					<div class="message-text-container">
						<span>${message_text}</span>
					</div>
				</div>
			</li>`;
		}
	});

	document.querySelector("#footer").scrollIntoView({ block: "end", behavior: "smooth" });
	document.querySelector("#prompt-input").focus();
}

function newChat() {
	var chats = JSON.parse(localStorage.getItem("chats"));
	var chat_id = chats.length;
	console.log(typeof(chats));
	chats.push({
		"id": chat_id,
		"history": []
	});
	showChatsList(chats);
	localStorage.setItem("chats", JSON.stringify(chats));
	showChat(null, chat_id);

}

document.addEventListener('keyup', event => {
	if (event.shiftKey && event.code == "Enter")
	{
		document.querySelector("#prompt-input").value += "";
	} else if(event.code == 'Enter' && loading == false)
	{
		GetAnswer();
	}

	if (event.code == "Escape") {
		document.querySelector("#content").setAttribute("hidden", "");
		selectedChat = null;
		showChatsList(
			JSON.parse(
			localStorage.getItem("chats")
			)
		);
	}
});


window.addEventListener('load', () => {
	if (!localStorage.getItem("chats"))
		localStorage.setItem("chats", JSON.stringify([]));
	else showChatsList(
		JSON.parse(
			localStorage.getItem("chats")
			)
		);
});