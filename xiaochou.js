// 來自群友:夢
const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Mobile/15E148 Safari/604.1'

let appConfig = {
    ver: 1,
    title: 'xhamster',
    site: 'https://eia.jokerlu-sin.buzz',
    tabs: [
        {
            name: '麻豆视频',
            ext: {
                href: '/vodtype/121',
            },
            ui: 1,
        },
        {
            name: '91制片厂',
            ext: {
                href: '/vodtype/122',
            },
            ui: 1,
        },
        {
            name: '天美传媒',
            ext: {
                href: '/vodtype/123',
            },
            ui: 1,
        },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, href } = ext

    let url = appConfig.site + href
    if (page > 1) {
        url = url + `-${page}/`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    
    const $ = cheerio.load(data)
    $('#recommended-grids english-grid .div').each((_, element) => {
        const title = $(element).find('h5 a').text().trim()
        const cover = $(element).find('img').attr('src')
        const href = $(element).find('h5 a').attr('href')
        
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: '',
            ext: {
                url: href,
            },
        })
    })
    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext.url
    
     const { data } = await $fetch.get(url, {
        headers: {
             'User-Agent': UA,
            },
    })
    
    const $ = cheerio.load(data)
    let m3u8Url = null
    $('script').each((i, script) => {
        const content = $(script).html()
        if (content.includes('.m3u8')) {
            m3u8Url = content.match(/https?:\/\/[\w./-]+\.m3u8/)[0]
            if (m3u8Url) {
                tracks.push({
                    name: '播放',
                    ext: {
                        url: m3u8Url,
                    },
                })
            }
        }
    })
    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks,
            },
        ],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url
    return jsonify({ urls: [url] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []
    const text = encodeURIComponent(ext.text)
     let page = ext.page || 1
    
     let url = `${appConfig.site}/search/${text}/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&q=${text}&category_ids=&sort_by=&from_videos=${page}&from_albums=${page}`
    
    const { data } = await $fetch.get(url, {
        headers:  {
            'User-Agent': UA,
            },
    })
    
    const $ = cheerio.load(data)
    $('#list_videos_videos_list_search_result_items .item').each((_, element) => {
        const title = $(element).find('h4 a').text().trim()
        const cover = $(element).find('img').attr('data-src')
        const href = $(element).find('h4 a').attr('href')
        const duration = $(element).find('.card-video__duration').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_duration: duration,
            vod_remarks: '',
            ext: {
                url: href,
            },
        })
    })
    return jsonify({
        list: cards,
    })
}
