const { BlogImg } = require('../db/mysql/model')

async function deleteBlogImg({listOfId}){
    let where = { id: listOfId }
    let row = await BlogImg.destroy({where})
    if(listOfId.length !== row){
        return false
    }
    return true
}

async function updateBlogImg({id, data}){
    let where = { id }
    let [ row ] = await BlogImg.update(data, { where })
    if(!row){
        return false
    }
    return true
}

async function updateBulkBlogImg(dataList){
    let promiseList = []
    dataList.reduce( async (initVal, {id, data}) => {
        initVal.push( await updateBlogImg({id, data}) )
        return initVal
    }, promiseList)
    
    let res = (await Promise.all(promiseList)).every(boo => boo)
    
    if(!res){
        return false
    }

    return true
}

module.exports = {
    deleteBlogImg,
    updateBlogImg,
    updateBulkBlogImg
}