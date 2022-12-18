const qrcode = require('qrcode-terminal')
const  { Client, LocalAuth } = require('whatsapp-web.js')
const { Configuration, OpenAIApi } = require("openai")
const keynya = "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"  //Input your OpenAI api-Key -> https://beta.openai.com/account/api-keys
const configuration = new Configuration({
  apiKey: keynya,
});
const openai = new OpenAIApi(configuration);
let { ucaphalo } = require('./lib')
const client = new Client({
  puppeteer: {
		args: ['--no-sandbox'],
	},
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('message', async (message) => {
    let chat = await message.getChat();
    let {from} = message
    try {
        const body = message.body.toLowerCase()
        const prefix = /^[./~!#%^&=\,;:()]/.test(body) ? body.match(/^[./~!#%^&=\,;:()]/gi) : '#'
        const isCmd = body.startsWith(prefix);
        const args = body.trim().split(/ +/).slice(1);
        const ishalo = await ucaphalo(body)
        let contact = await message.getContact();
        await client.sendSeen(from) 
	//if (Spamchat) {.... this is Premium features (contact owner)
        if (isCmd) {
            console.log(`[CMD] From (${contact.pushname}) ~> ${message.body}`)
        } else if (ishalo) {
            message.reply(`[!]Bot \n\n\n Silahkan gunakan fitur ini langsung menanyakan tanpa ada command .bot`);
        } else if (args.length < 2) {
            message.reply(`Maaf, kata yang harus dimasukan minimal 3 karakter !! \n\n\n Bot ini dibuat oleh codepad@usa.com`);
        } else if (!chat.isGroup) {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: body,
                temperature: 0,
                max_tokens: 3000,
                top_p: 1.0,
                n: 1,
                logprobs: null,
                stop: "\n",
                stream: false,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            });
            const resultnya = response.data.choices[0].text;
            client.sendMessage(from ,"*[ ! ]Jawaban :*" + resultnya);
            console.log(`[!] Message From (${contact.pushname}) ~> ${message.body}`)
        }
    } catch (err) {
        console.log(err)
    }
});
client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
