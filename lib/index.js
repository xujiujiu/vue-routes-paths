const fs = require('fs')
const path = require('path')
const readline = require('readline')
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
const codeToArr = (fileCode) => {
    // console.log('EOL:', os.EOL)
    fileCode = fileCode.replace(/\'/g, '"')
    // console.log(fileCode)
    let codeArr = fileCode.split(os.EOL)
    let len = codeArr.length
    let routeCode = [""]
    let leftCount = 0  // [ 的数量
    let leftLargeCount = 0  // { 的数量
    let routeLen = 1
    console.log(len)
    for (let i = 0; i < len; i ++) {
        let line = codeArr[i]
        let content = line.replace(/ /g, '').replace(/\ +/g,"").replace(/[\r\n]/g,"")
        if(content.includes('//')) {
            continue
        }
        if(content.includes('children:')) {
            routeCode[routeLen - 1] !== '' && (routeCode[routeLen - 1] = routeCode[routeLen - 1] + ',"children":')
            if(content.includes('children:')) {

            }
        }
        if(content.includes('[')) {
            if(leftCount === 0 && routeCode[routeLen - 1] !== '') {
                routeCode.push("")
            }
            if(routeCode[routeLen - 1] !== '') {
                routeCode[routeLen - 1] += '['
            }
            leftCount = leftCount + 1
        }
        if(content.includes('{')) {
            if(routeCode[routeLen - 1] !== '' && leftCount !== 0) {
                routeCode[routeLen - 1] += routeCode[routeLen - 1][routeCode[routeLen - 1].length -1] === '[' ? '{' : ',{'
            }
            leftLargeCount = leftLargeCount + 1
        }
        if(content.includes('path:')) {
            if(routeCode[routeLen - 1] === '') {
                routeCode[routeLen - 1] += '[{'
            }
            routeCode[routeLen - 1] += content.replace('path', '"path"').replace(/\,/g, '')
        }
        if(content.includes('}')) {
            if(routeCode[routeLen - 1] !== '' && leftCount !== 0) {
                routeCode[routeLen - 1] += '}'
            }
            leftLargeCount = leftLargeCount - 1
        }
        if(content.includes(']')) {
            if(routeCode[routeLen - 1] !== '') {
                routeCode[routeLen - 1] += ']'
            }
            leftCount = leftCount - 1
        }
    }
    let arr = []
    routeCode.forEach(routeStr => {
        arr.push(...JSON.parse(routeStr))
    })
    return arr
}
const getPath = (filename) => {
    if(!fs.existsSync(process.cwd() + filename)){
        return {
            error: '文件不存在'
        }
    }
    let fileStr = fs.readFileSync(path.join(process.cwd(), filename.replace('/', path.sep)), 'utf-8')
    let routes = codeToArr(fileStr)
    console.log(routeToPaths(routes))
    return routeToPaths(routes)
}
module.exports = getPath
