import path from "node:path";
import { Reactions, Zalo } from "../src/index.js";
import { MessageType } from "../src/models/Message.js";
const zalo = new Zalo(
    {
        cookie: {'_ga': 'GA1.2.903196771.1728571096', '_gid': 'GA1.2.797667413.1728571096', '_zlang': 'vn', 'zpsid': '89NB.423101413.0.3a-Lm5Ks27omDJ1bMJO8V215UaXd1JbCP08vJtgsuTsIz1rHL4FXUp8s27m', 'zpw_sek': 'dqPI.423101413.a0.XWYQT-wpi-KBi8lypxEpvPMHrexCYP6zeyk5iC67mPISoi3NdUJHhwVZXQw_Zex7avmp34zqSV33iiKCwTIpvG', '__zi': '3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8WyckoacKbOYt6VwgNTJLY8Vfpgh3Cn.1', '__zi-legacy': '3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8WyckoacKbOYt6VwgNTJLY8Vfpgh3Cn.1', 'app.event.zalo.me': '6417841313632871577'},
        imei: "038366e2-c323-47f8-b250-d196e14d1420-16453d6e2683b8800ded2a27c7f595d9",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        language: "vi",
    },
    {
        selfListen: true,
        checkUpdate: true,
    },
);

const api = await zalo.login();
const { listener } = api;

listener.onConnected(() => {
    console.log("Connected");
});

listener.onClosed(() => {
    console.log("Closed");
});

listener.onError((error: any) => {
    console.error("Error:", error);
});

listener.onMessage((message) => {
    console.log("Message:", message.threadId, message.data.content);
    switch (message.type) {
        case MessageType.DirectMessage:
            api.addReaction(Reactions.HAHA, message).then(console.log);
            if (!message.data.content || typeof message.data.content != "string") return;
            if (!message.isSelf) {
                switch (message.data.content) {
                    case "reply": {
                        api.sendMessage(
                            {
                                msg: "reply",
                                quote: message,
                            },
                            message.threadId,
                            message.type,
                        ).then(console.log);
                        break;
                    }
                    case "ping": {
                        api.sendMessage("pong", message.threadId).then(console.log);
                        break;
                    }
                    default: {
                        const args = message.data.content.split(/\s+/);
                        if (args[0] == "sticker" && args[1]) {
                            api.getStickers(args[1]).then(async (stickerIds) => {
                                const random = stickerIds[Math.floor(Math.random() * stickerIds.length)];
                                const sticker = await api.getStickersDetail(random);
                                console.log("Sending sticker:", sticker[0]);

                                if (random) api.sendSticker(sticker[0], message.threadId).then(console.log);
                                else api.sendMessage("No sticker found", message.threadId).then(console.log);
                            });
                        }
                        break;
                    }
                }
            } else {
                const args = message.data.content.split(/\s+/);
                if (args[0] == "find" && args[1]) {
                    api.findUser(args[1]).then(console.log);
                } else if (args[0] == "get") {
                    api.sendMessage(
                        {
                            msg: "hi",
                            attachments: [path.resolve("./test/a.png")],
                        },
                        message.threadId,
                        message.type,
                    ).then(console.log);
                }
            }
            break;

        case MessageType.GroupMessage:
            if (!message.isSelf) {
                switch (message.data.content) {
                    case "ping": {
                        api.sendMessage("pong", message.threadId, message.type).then(console.log);
                        break;
                    }
                    default:
                        break;
                }
            }
            break;

        default:
            break;
    }
});

listener.start();
