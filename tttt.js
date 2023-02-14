const {readBlog} = require('./server/blog')
async function r(){
    let x = await readBlog({blog_id: 4}, true)
}

r()