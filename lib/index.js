const fs = require('fs')
const path = require('path')
const os = require('os')

const routeToPaths = (routeArr) => {
    let paths = []
    routeArr.forEach(item => {
        let path = item.path === '' ? '' : (item.path === '/' ? '/' : item.path + '/')
        if(item.children && item.children.length > 0) {
            let pathChildrens = routeToPaths(item.children)
            pathChildrens.forEach(ipath => {
                paths.push(path + ipath)
            })
        } else {
            paths.push(path)
        }
    });
    return paths
}

const getPath = (filename) => {
    console.log('getpath')
    if(!fs.existsSync(process.cwd() + filename)){
        console.error('文件不存在')
        return {
            error: '文件不存在'
        }
    }
    let fileStr = fs.readFileSync(path.join(process.cwd(), filename.replace('/', path.sep)), 'utf-8')
    let routesStr = "[" + fileStr.replace(/ /g, '').replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/\'/g, '"').replace(/\/\//g, '').replace(/(?<=\/\*).*?(?=\*\/)/g,'').replace(/(\/\*)|(\*\/)/g, '').replace(/(?<=component\:\(\)\=\>).*?(?=\)(\,?))/g, '').replace(/(component\:\(\)\=\>)|(\,\))/g, '').replace(/\,\)/g,'').match(/(?<=routes\:\[).*?(?=\]\,)/)[0].replace(/(?<=[\,|\{])([a-zA-Z]+)(?=\:)/g,`"$1"`) + "]"
    let routes = JSON.parse(routesStr)
    let paths = routeToPaths(routes)
    console.log(paths)
    return paths
}
module.exports = getPath
