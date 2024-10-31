const axios = require('axios');
const cheerio = require('cheerio');
const { Resend } = require('resend');

const url = 'https://ge.globo.com/futebol/times/fluminense/';
const resend = new Resend('re_gYgcRj9h_3WDLQKCgqfhyRhjGt8ujEhU9');

async function scrapeFluminenseNews() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const articles = [];
        $('.bastian-feed-item').each((index, element) => {
            const title = $(element).find('.feed-post-body-title p').text();
            const image = $(element).find('img').attr('src');
            const summary = $(element).find('.feed-post-body-resumo p').text();
            const timestamp = $(element).find('.feed-post-datetime').text();

            articles.push({
                title,
                image,
                summary,
                timestamp
            });
        });

        await sendEmail(articles);
    } catch (error) {
        console.error('Erro ao fazer o scrape:', error);
    }
}

async function sendEmail(articles) {
    const articleHtml = articles.map(article => `
        <div>
            <h2>${article.title}</h2>
            <img src="${article.image}" alt="${article.title}" style="max-width: 100%; height: auto;" />
            <p>${article.summary}</p>
            <p><em>${article.timestamp}</em></p>
            <hr />
        </div>
    `).join('');

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'gabriel.victor.m04@gmail.com',
            subject: 'Últimas Notícias do Fluminense',
            html: `<div>${articleHtml}</div>`
        });
        console.log('Email enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar o email:', error);
    }
}

scrapeFluminenseNews();
