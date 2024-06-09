var express=require('express')
var mysql =require('mysql')
var fs=require('fs')
const cors = require('cors')
var session = require('express-session')

//var staitc=require('express.static')
express.static('../../')
//创建路由对象
var routeReg =express.Router()
var querystring = require('querystring')
routeReg.use(cors())
routeReg.use(session({
    secret:'hello',        //secret属性值可以自己指定
    resave: false,         //固定写法
    saveUninitialized:true  //固定写法
  }))

  var connection = mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'asdfghjkl123qaz',
    database:'mydatabase',
    port:3307
});


routeReg.get('/', (req, res) => {
    console.log('homepage')
    //res.sendFile('../index.html')

    readFile('../index.html',function (err,data){
        if (err) {
            res.writeHead(404,{'Content-Type':'text/html'});
            res.end('读取文件失败')
        }else {
            console.log('send homepage')
            res.writeHead(200,{'Content-Type':'text/html'})           
            res.write(data.toString())
            res.end()
        }
    })
})

routeReg.post('/api/login', (req, res) => {
    
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })

    console.log('login ',body)
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        
        // 设置响应头部信息及编码
        //res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        res.setHeader('Content-Type', 'application/json');
        if(body.username && body.password && body.auth && body.hash2) { // 输出提交的数据
            connection.connect;
            console.log('get username is ',body.username)
            console.log('get authenticator is ',body.auth)
            console.log('get client hash2 is ',body.hash2)
            const sqlStr ='select * from users where username= ?'
            //注册前看该用户能否注册，如果系统中已经有该用户名则不能注册，否则可以注册
            connection.query(sqlStr,body.username,(err,results)=>{
                if (err) {
                    
                    res.end()
                    return 
                }
                if (results.length > 0) {
                    const hash1 = results[0].password
                    const hash2 = Sha256Encrypt(hash1 + body.auth)
                    console.log('server hash2 is ',hash2)
                    // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
                    if (hash2 == body.hash2) {
                        req.session.user = body        //将用户信息存储到Session中
                        req.session.islogin = true     //将用户的登录状态，存储到Session中
                        const ciphertext = encryptDecrypt(body.auth,hash1,true)
                        console.log('ciphertext is ',ciphertext)
                        //const originaltext = decrypt(ciphertext,hash1)
                        //console.log('originaltext is',originaltext)
                        res.send({suc:"msg:查询到该用户名,登录成功！",ciphertext:ciphertext})
                        //res.write(ciphertext)
                        //res.write("msg:查询到该用户名,登录成功！")       
                        res.end()
                        //return 
                    }
                    else{
                        res.write("msg:用户名或密码不对，请重新输入！")
                        //res.send({suc:0});
                        res.end()
                    }
                    

                    
                }      
            })
        } 
        else {  // 通知客户端登录失败                
                res.write('登录信息不全');
                res.end();
        }
    })
})

routeReg.post('/api/reguser', (req, res) => {
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })

    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
    
        if(body.username && body.password) { // 输出提交的数据
            //查询库表内信息            
            connection.connect;
            console.log('get username is ',body.username)
            console.log('get password is ',body.password)
            const sqlStr ='select * from users where username= ?'
            //注册前看该用户能否注册，如果系统中已经有该用户名则不能注册，否则可以注册
            connection.query(sqlStr,body.username,(err,results)=>{
                if (err) {
                    res.write("msg:查询失败")
                    res.end()
                    return 
                }
                if (results.length > 0) {
                    // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
                    console.log('select username is ',results[0].username)
                    res.write("msg:用户名被占用，请更换其他用户名！")        
                    res.end()
                    return 
                }                
                else {
                    //新用户，注册进入数据库
                    console.log('will insert user information')
                    const message = body.username + body.password
                    console.log(message)
                    const hashedMessage = Sha256Encrypt(message)
                    console.log(hashedMessage)
                    const sqlStr1 = 'insert into users (username, password) values (?, ?)'
                    // 执行 SQL 语句
                    connection.query(sqlStr1, [body.username, hashedMessage], (err, results) => {
                        // 执行 SQL 语句失败了
                        if (err) return console.log(err.message)
                        // 插入成功
                        if (results.affectedRows === 1) {
                            console.log('插入数据成功!')
                            res.write("msg:注册成功")
                            res.end()
                        }   
                    }) 
                }
            })            
        }
        else {  // 通知客户端注册失败                
                res.write("msg:注册信息不全");
                res.end();
        }
    })
})

routeReg.post('/api/change', (req, res) => {
    
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })

    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        //res.setHeader('Content-Type', 'application/json');
        if(body.username && body.oldpassword && body.newpassword && body.auth && body.hash2) { // 输出提交的数据
            connection.connect;
            console.log('get username is ',body.username)
            console.log('get oldpassword is ',body.oldpassword)
            console.log('get newpassword is ',body.newpassword)
            console.log('get authenticator is ',body.auth)
            console.log('get client hash2 is ',body.hash2)
            const sqlStr ='select * from users where username= ?'
            //注册前看该用户能否注册，如果系统中已经有该用户名则不能注册，否则可以注册
            connection.query(sqlStr,body.username,(err,results)=>{
                if (err) {
                    
                    res.end()
                    return 
                }
                if (results.length > 0) {
                    const hash1 = results[0].password
                    const hash2 = Sha256Encrypt(hash1 + body.auth)
                    console.log('server hash2 is ',hash2)
                    // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
                    if (hash2 == body.hash2) {
                        req.session.user = body        //将用户信息存储到Session中
                        req.session.islogin = true     //将用户的登录状态，存储到Session中
                        console.log('will insert user newpassword')
                        const message = body.username + body.newpassword
                        console.log(message)
                        const hashedMessage = Sha256Encrypt(message)
                        console.log(hashedMessage)
                        const sqlStr = 'update users set password = ? where username = ?'
                        //执行sql语句
                        connection.query(sqlStr, [hashedMessage,body.username], (err, results) => {
                            // 执行 SQL 语句失败了
                            if (err) return console.log(err.message)
                            // 插入成功
                            if (results.affectedRows === 1) {
                                console.log('修改数据成功!')
                                res.write("msg:查询到该用户名,修改成功！")       
                                res.end()
                            }   
                        }) 
                        //return 
                    }
                    else{
                        res.write("msg:用户名或密码不对，请重新输入！")
                        //res.send({suc:0});
                        res.end()
                    }
                    

                    
                }      
            })
        } 
        else {  // 通知客户端登录失败                
                res.write('登录信息不全');
                res.end();
        }
    })
})

// 4. 监听客户端的 GET 和 POST 请求，并向客户端响应具体的内容
routeReg.get('/user', (req, res) => {
    // 调用 express 提供的 res.send() 方法，向客户端响应一个 JSON 对象
    res.send({ name: 'zs', age: 20, gender: '男' })
  })

  routeReg.post('/user', (req, res) => {
    // 调用 express 提供的 res.send() 方法，向客户端响应一个 文本字符串
    res.send('请求成功')
  })
  

  // 注意：这里的 :id 是一个动态的参数
routeReg.get('/user/:ids/:username', (req, res) => {
    // req.params 是动态匹配到的 URL 参数，默认也是一个空对象
    console.log(req.params)
    res.send(req.params)
  })
  
  
//向外公开路由对象
module.exports = routeReg

// 哈希
function Sha256Encrypt(encrypt_content, isupper = false) {
    const chrsz = 8
    function safe_add(x, y) {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF)
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
        return (msw << 16) | (lsw & 0xFFFF)
    }
    function S(X, n) {
        return (X >>> n) | (X << (32 - n))
    }
    function R(X, n) {
        return (X >>> n)
    }
    function Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z))
    }
    function Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z))
    }
    function Sigma0256(x) {
        return (S(x, 2) ^ S(x, 13) ^ S(x, 22))
    }
    function Sigma1256(x) {
        return (S(x, 6) ^ S(x, 11) ^ S(x, 25))
    }
    function Gamma0256(x) {
        return (S(x, 7) ^ S(x, 18) ^ R(x, 3))
    }
    function Gamma1256(x) {
        return (S(x, 17) ^ S(x, 19) ^ R(x, 10))
    }
    function core_sha256(m, l) {
        const K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2]
        const HASH = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]
        const W = new Array(64)
        let a, b, c, d, e, f, g, h, i, j
        let T1, T2
        m[l >> 5] |= 0x80 << (24 - l % 32)
        m[((l + 64 >> 9) << 4) + 15] = l
        for (i = 0; i < m.length; i += 16) {
            a = HASH[0]
            b = HASH[1]
            c = HASH[2]
            d = HASH[3]
            e = HASH[4]
            f = HASH[5]
            g = HASH[6]
            h = HASH[7]
            for (j = 0; j < 64; j++) {
                if (j < 16) {
                    W[j] = m[j + i]
                } else {
                    W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16])
                }
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j])
                T2 = safe_add(Sigma0256(a), Maj(a, b, c))
                h = g
                g = f
                f = e
                e = safe_add(d, T1)
                d = c
                c = b
                b = a
                a = safe_add(T1, T2)
            }
            HASH[0] = safe_add(a, HASH[0])
            HASH[1] = safe_add(b, HASH[1])
            HASH[2] = safe_add(c, HASH[2])
            HASH[3] = safe_add(d, HASH[3])
            HASH[4] = safe_add(e, HASH[4])
            HASH[5] = safe_add(f, HASH[5])
            HASH[6] = safe_add(g, HASH[6])
            HASH[7] = safe_add(h, HASH[7])
        }
        return HASH
    }
    function str2binb(str) {
        const bin = []
        const mask = (1 << chrsz) - 1
        for (let i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32)
        }
        return bin
    }
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, '\n')
        let utfText = ''
        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n)
            if (c < 128) {
                utfText += String.fromCharCode(c)
            } else if ((c > 127) && (c < 2048)) {
                utfText += String.fromCharCode((c >> 6) | 192)
                utfText += String.fromCharCode((c & 63) | 128)
            } else {
                utfText += String.fromCharCode((c >> 12) | 224)
                utfText += String.fromCharCode(((c >> 6) & 63) | 128)
                utfText += String.fromCharCode((c & 63) | 128)
            }
        }
        return utfText
    }
    function binb2hex(binarray) {
        const hex_tab = isupper ? '0123456789ABCDEF' : '0123456789abcdef'
        let str = ''
        for (let i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF)
        }
        return str
    }
    encrypt_content = Utf8Encode(encrypt_content)
    return binb2hex(core_sha256(str2binb(encrypt_content), encrypt_content.length * chrsz))
}

const CryptoJS = require('cry/crypto-js');

// 加密函数
function encryptDecrypt(text, key, encrypt) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        if (encrypt) {
            // 加密时，使用密钥对字符进行偏移
            charCode = (charCode + key.charCodeAt(i % key.length)) % 256;
        } else {
            // 解密时，使用密钥的负数偏移来恢复原始字符
            charCode = (charCode - key.charCodeAt(i % key.length) + 256) % 256;
        }
        result += String.fromCharCode(charCode);
    }
    return result;
}