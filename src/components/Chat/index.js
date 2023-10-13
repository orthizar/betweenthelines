import React, { useEffect, useRef, useState } from "react";
import { invokePipeline } from "../Helpers/refine";
import { suggest } from "../Helpers/learn";
import { BsStars } from "react-icons/bs";

const setSessionData = (name, value) => {
	try {
		sessionStorage.setItem(name, value);
	} catch (e) {
		console.error("Failed to save session data:", e);
	}
};

const Chat = ({ getPlainText, setTextWithHtml, state, shouldRefine }) => {
	const chatContainerRef = useRef(null);
	const [chatMessages, setChatMessages] = useState(state);
	const [chatInputDisabled, setChatInputDisabled] = useState(false);
	const [message, setMessage] = useState("");
	const [suggestion, setSuggestion] = useState(null);

	useEffect(() => {
		scrollToBottom();
	});

	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	};

	const updateChatMessages = (newMessages) => {
		setChatMessages(newMessages);
		setSessionData("chatMessages", JSON.stringify(newMessages));
	};

	const isMyMessage = (author) => author === "User";

	const sendMessage = async () => {
		if (message.trim() !== "") {
			updateChatMessages([
				...chatMessages,
				{
					id: chatMessages.length + 1,
					author: "User",
					text: message,
				},
			]);

			var messages = [...chatMessages, {
				id: chatMessages.length + 1,
				author: "User",
				text: message,
			}];
			setMessage("");
			updateChatMessages(messages);
			setChatInputDisabled(true);
			for await (const transformed of invokePipeline(getPlainText(), message, shouldRefine)) {
				if (transformed.output === undefined) {
					const chatResponse = transformed;
					messages = [...messages, {
						id: messages.length + 1,
						author: "Bot",
						text: chatResponse,
					}];
					updateChatMessages(messages);
				} else {
					const transformedText = transformed.output;
					const value = transformedText.replace(/(?:\r\n|\r|\n|\\n)/g, '\n').trim().replace(/\n/g, '<br>');
					setTextWithHtml(value);
					setChatInputDisabled(false);
					setSuggestion(null);
					return;
				}
			};
			setChatInputDisabled(false);
			setSuggestion(null);
		};
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	};

	if (suggestion === null) {
		setTimeout(async () => {
			const messages = chatMessages.filter((message) => isMyMessage(message.author)).map((message) => message.text);
			setSuggestion(await suggest(getPlainText(), messages));
		}, 0);
	}

	return (
		<div className="flex flex-col h-full">
			<div
				className="flex-grow overflow-y-auto max-h-[22rem]"
				ref={chatContainerRef}
			>
				<div className="mb-6 overflow-y-auto px-4">
					{chatMessages.map((chatMessage) => (
						<div
							key={chatMessage.id}
							className={`flex flex-col mb-3 ${isMyMessage(chatMessage.author) ? "items-end" : "items-start"
								}`}
						>
							<div
								className={`text-xs mb-1 ${isMyMessage(chatMessage.author)
									? "text-gray-600 mr-1"
									: "text-gray-600 ml-1"
									}`}
							>
								{!isMyMessage(chatMessage.author) && (
									<div className="text-xs mb-1 text-gray-600">
										{chatMessage.author}
									</div>
								)}
							</div>
							<div className={"max-w-[15rem]"}>
								<div
									className={`relative p-3 rounded-lg ${isMyMessage(chatMessage.author)
										? "bg-blue-200 text-right mr-1"
										: "bg-gray-200 ml-1"
										}`}
								>
									<p className={"text-left"}>{chatMessage.text}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="">
				{/* suggestion box */}
				<button
					className="text-xs w-full p-1 border rounded-md text-left text-gray mb-2 flex"
					onClick={() => {
						setMessage(suggestion);
						setSuggestion(null);
					}}>
					<BsStars /> {suggestion !== null ? suggestion : "Please wait..."}
				</button>
				<textarea
					onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => setTimeout(() => handleKeyDown(event), 0)}
					placeholder={chatInputDisabled ? "Please wait..." : "Type your message here..."}
					disabled={chatInputDisabled}
					value={message}
					className="w-full p-2 border rounded-md resize-none mb-2"
					rows="2"
					maxLength={280}
				></textarea>
				<button
					onClick={sendMessage}
					className="w-full bg-blue-500 text-white p-2 rounded"
				>
					Send
				</button>
			</div>
		</div>
	);
};
export default Chat;
