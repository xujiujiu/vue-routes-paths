#!/usr/bin/env node

const program = require('commander')
const getPath = require('./lib/index')
const fs = require('fs')
const path = require('path')



program.version(require('./package').version)
        .usage('[options] <filename ...>')
        .option('-f, --filename <filename>', '路由文件, 默认src/router/router.js')
        .action(({filename = '/src/router/router.js'}) => {
            let data = getPath(filename)
            if(!data.error) {
                console.log('finish!')
            } else {
                console.error(data.error)
            }
        })
        .parse(process.argv)

module.exports = {
    getPath
}
