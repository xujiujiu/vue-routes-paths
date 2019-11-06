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
const codeToArr = (fileCode) => {
    fileCode = fileCode.replace(/\'/g, '"')
    let codeArr = fileCode.split(os.EOL)
    let len = codeArr.length
    let routeCode = [""]
    let leftCount = 0  // [ 的数量
    let leftLargeCount = 0  // { 的数量
    let routeLen = 1
    for (let i = 0; i < len; i ++) {
        let line = codeArr[i]
        let content = line.replace(/ /g, '').replace(/\ +/g,"").replace(/[\r\n]/g,"")
        if(content.includes('//')) {
            continue
        }
        if(content.includes('children:')) {
            if(routeCode[routeLen - 1] !== ''){
                routeCode[routeLen - 1] = routeCode[routeLen - 1] + ',"children":'
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
                let lastStr = routeCode[routeLen - 1][routeCode[routeLen - 1].length -1]
                routeCode[routeLen - 1] += lastStr === '[' || lastStr === '{' ? '{' : ',{'
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
                let str = routeCode[routeLen - 1]
                let strLen = str.length
                if(str.lastIndexOf(',{') === strLen - 2) {
                    routeCode[routeLen - 1] = routeCode[routeLen - 1].slice(0, strLen - 2)
                }
                if(str.lastIndexOf('{') === strLen - 1) {
                    routeCode[routeLen - 1] = routeCode[routeLen - 1].slice(0, strLen - 1)
                } else {
                    routeCode[routeLen - 1] += '}'
                }
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
    let paths = routeToPaths(routes)
    console.log(paths)
    return paths
}
module.exports = getPath
