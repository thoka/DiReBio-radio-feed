const Crawler = require('crawler')
const RSS = require('rss')
// const fixUtf8 = require('fix-utf8')
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

var c = new Crawler({
    maxConnections : 10,
    callback : (error, res, done) => {
        if(error){
            console.log(error);
        }else{
            let $ = res.$;
            let items = []

            $('.view-content-wrap > div.item').each( (i,data) => {
                let description = $('div.field.field--name-body.field--type-text-with-summary.field--label-hidden.field__item',data).text()
                description = entities.encodeNonUTF(description)
                description = description.split('&#160;').join(' ')
                description = entities.decode(description)
                let files = []
                $('.field__item > .file > a',data).each( (i,link) => {
                
                   files.push( { href: $(link).attr('href'), text: $(link).text() } )
                })
                if (files.length > 1 ) {
                    files.forEach( (f,i) => items.push({ title: description + ` (Teil ${i+1})`, url: f.href, text: f.text} ) )
                } else {
                    files.forEach( (f,i) => items.push({ title: description, url: f.href, text: f.text} ))
                }
                // items.push({ description: description, files:files })
            })

            // ready here, write rss feed

            let rss = new RSS({
                title: "DiReBio audio feed"
            })
            items.forEach( (item,i) => {
                rss.item( item )
            })
            console.log(
                rss.xml({indent: true})
            )
        }
        done()
    }
})

c.queue('https://direbio.de/media-0')
