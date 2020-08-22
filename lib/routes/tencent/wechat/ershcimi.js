const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://www.ershicimi.com/a/${id}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const items = await Promise.all(
        $('.weui_media_box')
            .map(async (_, ele) => {
                const $item = cheerio.load(ele);
                const detail = await got('https://www.ershicimi.com' + $item('.weui_media_title a').attr('href'));
                const $detail = cheerio.load(detail.data);
                const url = $detail("meta[property='og:url']").attr('content');
                const single = {
                    title: $item('.weui_media_title a').text(),
                    link: url || $item('.weui_media_title a').attr('href'),
                    description: $item('.weui_media_desc').text(),
                    pubDate: new Date($item('.weui_media_extra_info').attr('title')).toUTCString(),
                };

                return Promise.resolve(single);
            })
            .get()
    );
    ctx.state.data = {
        title: `微信公众号 - ${$('span.name').text()}`,
        link: url,
        description: $('div.Profile-sideColumnItemValue').text(),
        item: items,
    };
};
