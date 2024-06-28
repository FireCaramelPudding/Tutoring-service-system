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
    password:'20021210',
    database:'software',
    port:3306
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
    readFile('../homepage.html',function (err,data){
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
    readFile('../家教.html',function (err,data){
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
                    if (hash2 === body.hash2) {
                        req.session.user = body        //将用户信息存储到Session中
                        req.session.islogin = true     //将用户的登录状态，存储到Session中
                        const ciphertext = encryptDecrypt(body.auth,hash1,true)
                        console.log('ciphertext is ',ciphertext)
                        res.send({suc:"msg:查询到该用户名,登录成功！",ciphertext:ciphertext,username:body.username})
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
                    if (hash2 === body.hash2) {
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

routeReg.post('/api/students', (req, res) => {
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })

    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
    
        if(body.username && body.subject && body.grade && body.name && body.phone && body.date && body.introduction) { // 输出提交的数据
            //查询库表内信息            
            connection.connect;
            console.log('get username is ',body.username)
            console.log('get subject is ',body.subject)
            console.log('get grade is ',body.grade)
            console.log('get name is ',body.name)
            console.log('get phone is ',body.phone)
            console.log('get date is ',body.date)
            console.log('get introduction is ',body.introduction)
            const sqlStr ='select * from students where phone= ?'
            //注册前看该用户能否注册，如果系统中已经有该用户名则不能注册，否则可以注册
            connection.query(sqlStr,body.phone,(err,results)=>{
                if (err) {
                    res.write("msg:查询失败")
                    res.end()
                    return 
                }
                if (results.length > 0) {
                    for(let i = 0; i < results.length; i++)
                        {
                            if(body.subject===results[i].subject && body.grade===results[i].grade && body.name===results[i].name
                                && body.phone===results[i].phone && body.date===results[i].date)
                                {
                                    res.write("msg:信息重复！")        
                                    res.end()
                                    return
                                }
                        }
                    //新的信息，注册进入数据库
                    console.log('will insert student information')
                    const sqlStr1 = 'insert into students (username,subject,grade,name,phone,date,introduction) values (?, ?, ?, ?, ?, ?, ?)'
                    // 执行 SQL 语句
                    connection.query(sqlStr1, [body.username, body.subject, body.grade, body.name, body.phone, body.date, body.introduction], (err, results) => {
                        // 执行 SQL 语句失败了
                        if (err) return console.log(err.message)
                        // 插入成功
                        if (results.affectedRows === 1) {
                            console.log('插入数据成功!')
                            res.write("msg:学生信息提交成功")
                            res.end()
                        }   
                    }) 
                   
                }                
                else {
                    //新用户，注册进入数据库
                    console.log('will insert student information')
                    const sqlStr1 = 'insert into students (username,subject,grade,name,phone,date,introduction) values (?, ?, ?, ?, ?, ?, ?)'
                    // 执行 SQL 语句
                    connection.query(sqlStr1, [body.username, body.subject, body.grade, body.name, body.phone, body.date, body.introduction], (err, results) => {
                        // 执行 SQL 语句失败了
                        if (err) return console.log(err.message)
                        // 插入成功
                        if (results.affectedRows === 1) {
                            console.log('插入数据成功!')
                            res.write("msg:学生信息提交成功")
                            res.end()
                        }   
                    }) 
                }
            })            
        }
        else {  // 通知客户端注册失败                
                res.write("msg:提交信息不全");
                res.end();
        }
    })
})

routeReg.post('/api/teachers', (req, res) => {
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })

    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
       
        if(body.username && body.subject && body.grade && body.name && body.phone && body.date && body.introduction) { // 输出提交的数据
            //查询库表内信息            
            connection.connect;
            console.log('get username is ',body.username)
            console.log('get subject is ',body.subject)
            console.log('get grade is ',body.grade)
            console.log('get name is ',body.name)
            console.log('get phone is ',body.phone)
            console.log('get date is ',body.date)
            console.log('get introduction is ',body.introduction)
            const sqlStr ='select * from teachers where phone= ?'
            //注册前看该用户能否注册，如果系统中已经有该用户名则不能注册，否则可以注册
            connection.query(sqlStr,body.phone,(err,results)=>{
                if (err) {
                    res.write("msg:查询失败")
                    res.end()
                    return 
                }
                if (results.length > 0) {
                    for(i=0;i++;results[i]!=null)
                        {
                            if(body.subject===results[i].subject && body.grade===results[i].grade && body.name===results[i].name
                                && body.phone===results[i].phone && body.date===results[i].date)
                                {
                                    res.write("msg:信息重复！")        
                                    res.end()
                                    return 
                                }
                        }
                    //新的信息，注册进入数据库
                    console.log('will insert teacher information')
                    const sqlStr1 = 'insert into teachers (username,subject,grade,name,phone,date,introduction) values (?, ?, ?, ?, ?, ?, ?)'
                    // 执行 SQL 语句
                    connection.query(sqlStr1, [body.username, body.subject, body.grade, body.name, body.phone, body.date, body.introduction], (err, results) => {
                        // 执行 SQL 语句失败了
                        if (err) return console.log(err.message)
                        // 插入成功
                        if (results.affectedRows === 1) {
                            console.log('插入数据成功!')
                            res.write("msg:家教信息提交成功")
                            res.end()
                        }   
                    }) 
                   
                }                
                else {
                    //新用户，注册进入数据库
                    console.log('will insert teacher information')
                    const sqlStr1 = 'insert into teachers (username,subject,grade,name,phone,date,introduction) values (?, ?, ?, ?, ?, ?, ?)'
                    // 执行 SQL 语句
                    connection.query(sqlStr1, [body.username, body.subject, body.grade, body.name, body.phone, body.date, body.introduction], (err, results) => {
                        // 执行 SQL 语句失败了
                        if (err) return console.log(err.message)
                        // 插入成功
                        if (results.affectedRows === 1) {
                            console.log('插入数据成功!')
                            res.write("msg:家教信息提交成功")
                            res.end()
                        }   
                    }) 
                }
            })            
        }
        else {  // 通知客户端注册失败                
                res.write("msg:提交信息不全");
                res.end();
        }
    })
})

//用于提供学生推荐数据
routeReg.post('/api/s_getData', (req, res) => {
    let body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
       
        if (body.username) {
            connection.connect;
                
                const sqlStr = 'select * from students where username= ?';
                connection.query(sqlStr, [body.username], (err, results) => {
                    if (err) {
                        console.error("查询学生信息失败:", err);
                        res.end("查询学生信息失败");
                        return;
                    }
                    if (results.length > 0) {
                        const student = results[0]; // 取第一个结果，假设username是唯一的
                        const subject = student.subject;
                        const grade = student.grade;
                        const date = student.date;
                        
                        // 执行第一个查询
                        const sql1 = 'select * from teachers where subject = ? and grade = ? and date = ?';
                        connection.query(sql1, [subject, grade, date], (err, results1) => {
                            if (err) {
                                console.error("查询教师信息失败:", err);
                                res.end("查询教师信息失败");
                                return;
                            }
                            
                            // 执行第二个查询
                            const sql2 = 'select * from teachers where subject = ? and grade = ?';
                            connection.query(sql2, [subject, grade], (err, results2) => {
                                if (err) {
                                    console.error("查询教师信息失败:", err);
                                    res.end("查询教师信息失败");
                                    return;
                                }
        
                                // 执行第三个查询
                                const sql3 = 'select * from teachers where subject = ?';
                                connection.query(sql3, [subject], (err, results3) => {
                                    if (err) {
                                        console.error("查询教师信息失败:", err);
                                        res.end("查询教师信息失败");
                                        return;
                                    }
        
                                    // 合并查询结果
                                    const mergedResults = results1.concat(results2).concat(results3);
                                    //console.log(mergedResults);
        
                                    // 创建一个映射，键是'subject-grade-date'的组合，值是教师对象
                                    const uniqueMap = new Map();

                                    // 填充映射，同时自动去除重复项
                                    mergedResults.forEach(teacher => {
                                             const key = `${teacher.subject}-${teacher.grade}-${teacher.date}`;
                                             uniqueMap.set(key, teacher);
                                      });
                                    
                                    // 从映射中提取唯一的教师对象数组
                                    const uniqueResults = Array.from(uniqueMap.values());
                                    //console.log(uniqueResults);
                                    if(uniqueResults.length===0){
                                        res.send("msg:无推荐")
                                        res.end();
                                        return;
                                    }
                                    else{
                                    // 发送合并后的结果
                                    res.send(uniqueResults);
                                    res.end();
                                    return;
                                    }
                                });
                            });
                        });
                    } else {
                        res.end("未找到学生信息");
                    }
                });
           
        }
                  
        else {
            res.end("缺少用户名");
            return;
        }
    });
});

//用于提供老师推荐数据
routeReg.post('/api/t_getData', (req, res) => {
    let body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
       
        if (body.username) {
            connection.connect;
                
                const sqlStr = 'select * from teachers where username= ?';
                connection.query(sqlStr, [body.username], (err, results) => {
                    if (err) {
                        console.error("查询老师信息失败:", err);
                        res.end("查询老师信息失败");
                        return;
                    }
                    if (results.length > 0) {
                        const student = results[0]; // 取第一个结果，假设username是唯一的
                        const subject = student.subject;
                        const grade = student.grade;
                        const date = student.date;
                        
                        // 执行第一个查询
                        const sql1 = 'select * from students where subject = ? and grade = ? and date = ?';
                        connection.query(sql1, [subject, grade, date], (err, results1) => {
                            if (err) {
                                console.error("查询学生信息失败:", err);
                                res.end("查询学生信息失败");
                                return;
                            }
                            
                            // 执行第二个查询
                            const sql2 = 'select * from students where subject = ? and grade = ?';
                            connection.query(sql2, [subject, grade], (err, results2) => {
                                if (err) {
                                    console.error("查询学生信息失败:", err);
                                    res.end("查询学生信息失败");
                                    return;
                                }
        
                                // 执行第三个查询
                                const sql3 = 'select * from students where subject = ?';
                                connection.query(sql3, [subject], (err, results3) => {
                                    if (err) {
                                        console.error("查询学生信息失败:", err);
                                        res.end("查询学生信息失败");
                                        return;
                                    }
        
                                    // 合并查询结果
                                    const mergedResults = results1.concat(results2).concat(results3);
                                    //console.log(mergedResults);
        
                                    // 创建一个映射，键是'subject-grade-date'的组合，值是教师对象
                                    const uniqueMap = new Map();

                                    // 填充映射，同时自动去除重复项
                                    mergedResults.forEach(teacher => {
                                             const key = `${teacher.subject}-${teacher.grade}-${teacher.date}`;
                                             uniqueMap.set(key, teacher);
                                      });
                                    
                                    // 从映射中提取唯一的学生对象数组
                                    const uniqueResults = Array.from(uniqueMap.values());
                                    //console.log(uniqueResults);
                                    if(uniqueResults.length===0){
                                        res.send("msg:无推荐");
                                        res.end();
                                        return;
                                    }
                                    else{
                                    // 发送合并后的结果
                                    res.send(uniqueResults);
                                    res.end();
                                    return;
                                    }
                                });
                            });
                        });
                    } else {
                        res.end("msg:未找到教师信息");
                    }
                });
           
        }
        else {
            res.end("缺少用户名");
            return;
        }
    });
});

//接收学生搜索数据
routeReg.post('/api/s_search', (req, res) => {
    let body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
       
        if (Object.keys(body).length === 4) {
            connection.connect;
            const sqlStr = 'select * from teachers where subject = ? and grade = ? and date = ? and name = ?';
            connection.query(sqlStr, [body.subject,body.grade,body.date,body.name], (err, results) => {
                    if (err) {
                        console.error("查询失败:", err);
                        res.end("搜索查询失败");
                        return;
                    }
                    if(results.length > 0){
                        console.log(results)
                        res.send(results)
                        res.end()
                        return;
                    } 
                    else {
                        res.write("msg:未找到教师");
                        res.end()
                        return;
                    }
                });
          return;
        } 
       if(Object.keys(body).length === 3){
        connection.connect;
        if(body.subject&&body.grade&&body.date){
            const sql1 = 'select * from teachers where subject = ? and grade = ? and date = ?'
            connection.query(sql1, [body.subject,body.grade,body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.subject&&body.grade&&body.name){
            const sql2 = 'select * from teachers where subject = ? and grade = ? and name = ?'
            connection.query(sql2, [body.subject,body.grade,body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.subject&&body.date&&body.name){
            const sql3 = 'select * from teachers where subject = ? and date = ? and name = ?'
            connection.query(sql3, [body.subject,body.date,body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.grade&&body.date&&body.name){
            const sql4 = 'select * from teachers where grade = ? and date = ? and name = ?'
            connection.query(sql4, [body.grade,body.date,body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        return;
       }
 
       if(Object.keys(body).length === 2){
        connection.connect;
        if(body.subject&&body.grade){
            const sql5 = 'select * from teachers where subject = ? and grade = ?'
            connection.query(sql5, [body.subject,body.grade], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.subject&&body.name){
            const sql6 = 'select * from teachers where subject = ? and name = ?'
            connection.query(sql6, [body.subject,body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.subject&&body.date){
            const sql7 = 'select * from teachers where subject = ? and date = ?'
            connection.query(sql7, [body.subject,body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.grade&&body.date){
            const sql8 = 'select * from teachers where grade = ? and date = ?'
            connection.query(sql8, [body.grade,body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.grade&&body.name){
            const sql9 = 'select * from teachers where grade = ? and name = ?'
            connection.query(sql9, [body.grade,body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.date&&body.name){
            const sql10 = 'select * from teachers where date = ? and name = ?'
            connection.query(sql10, [body.date,body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        return;
       }

       if(Object.keys(body).length === 1){
        connection.connect;
        if(body.subject){
            const sql11 = 'select * from teachers where subject = ?'
            connection.query(sql11, [body.subject], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.grade){
            const sql12 = 'select * from teachers where grade = ?'
            connection.query(sql12, [body.grade], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.date){
            const sql3 = 'select * from teachers where date = ?'
            connection.query(sql3, [body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.name){
            const sql14 = 'select * from teachers where name = ?'
            connection.query(sql14, [body.name], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到教师");
                    res.end()
                    return;
                }
            });
            return;
        }
        return;
       }

        else {
            res.end("缺少用户名");
            return;
        }
    });
});

routeReg.post('/api/t_search', (req, res) => {
    let body = "";
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
       
        if (Object.keys(body).length === 3) {
            connection.connect;
            const sqlStr = 'select * from students where subject = ? and grade = ? and date = ?';
            connection.query(sqlStr, [body.subject,body.grade,body.date], (err, results) => {
                    if (err) {
                        console.error("查询失败:", err);
                        res.end("搜索查询失败");
                        return;
                    }
                    if(results.length > 0){
                        console.log(results)
                        res.send(results)
                        res.end()
                        return;
                    } 
                    else {
                        res.write("msg:未找到学生");
                        res.end()
                        return;
                    }
                });
          return;
        } 
 
       if(Object.keys(body).length === 2){
        connection.connect;
        if(body.subject&&body.grade){
            const sql5 = 'select * from students where subject = ? and grade = ?'
            connection.query(sql5, [body.subject,body.grade], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到学生");
                    res.end()
                    return;
                }
            });
            return;
        }
        
        if(body.subject&&body.date){
            const sql7 = 'select * from students where subject = ? and date = ?'
            connection.query(sql7, [body.subject,body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到学生");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.grade&&body.date){
            const sql8 = 'select * from students where grade = ? and date = ?'
            connection.query(sql8, [body.grade,body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到学生");
                    res.end()
                    return;
                }
            });
            return;
        }
        
        return;
       }

       if(Object.keys(body).length === 1){
        connection.connect;
        if(body.subject){
            const sql11 = 'select * from students where subject = ?'
            connection.query(sql11, [body.subject], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到学生");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.grade){
            const sql12 = 'select * from students where grade = ?'
            connection.query(sql12, [body.grade], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到学生");
                    res.end()
                    return;
                }
            });
            return;
        }
        if(body.date){
            const sql3 = 'select * from students where date = ?'
            connection.query(sql3, [body.date], (err, results) => {
                if (err) {
                    console.error("查询失败:", err);
                    res.end("搜索查询失败");
                    return;
                }
                if(results.length > 0){
                    console.log(results)
                    res.send(results)
                    res.end()
                    return;
                } 
                else {
                    res.write("msg:未找到学生");
                    res.end()
                    return;
                }
            });
            return;
        }
        
        return;
       }

        else {
            res.end("缺少用户名");
            return;
        }
    });
});

//GET路由，用于提供评论数据
routeReg.get('/api/getComment', (req, res) => {
    // 这里我们返回所有评论者加上评论数据
        console.log(req.query)
        const username = req.query.username
        const teachername = req.query.teachername
        console.log('name:',username)
        connection.connect;
        const sqlStr = 'SELECT username, studentname, teachername, comment FROM comments WHERE username = ? AND teachername = ?';
        
        connection.query(sqlStr,[username,teachername],(err,results)=>{
            // console.log(results)
            if(err){
                console.log('连接错误: ',err)
                return
            }
            if(results.length === 0){
                const data = []
                res.json(data);
            }
            else{
                const data = results.map(row => ({
                    student: row.studentname,
                    comment: row.comment
                }));
                console.log(data); // 输出结果将是 [ { student: 'StudentA', comment: 'This is a great course!' } ]
                res.json(data);
            }
        })
});

routeReg.post('/api/comment', (req, res) => {
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })
    
    req.on('end', function () {
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        if (!body.username || !body.teachername || !body.studentname || !body.comment) {
            return res.status(400).send('<html><body><p>提交信息不全</p></body></html>');
        }
        console.log(body.username, body.teachername, body.studentname, body.comment)
    
        // 构建 SQL 插入语句
        const sqlStr = 'INSERT INTO comments (username, teachername, studentname, comment) VALUES (?, ?, ?, ?)';
    
        // 执行 SQL 插入操作
        connection.query(sqlStr, [body.username, body.teachername, body.studentname, body.comment], (err, results) => {
            if (err) {
                // 发生错误，返回错误信息
                res.write("msg:查询失败")
                res.end()
                console.log(err)
                return 
            }
    
            if (results.affectedRows === 1) {
                // 数据插入成功
                console.log('成功')
                res.write("msg:评论信息提交成功")
                res.end()
            } else {
                // 数据插入未影响任何行
                res.write("msg:评论信息未提交")
                res.end()
            }
    })
})
});

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

//以下为新内容,为个人中心-我的发布编写
routeReg.get('/api/my-posts', (req, res) => {
    const username = req.query.username;
    console.log(`Received request for username: ${username}`);

    // SQL查询语句，分别从teachers和students表格中查找数据
    var sqlStr = `
        (SELECT name, subject, grade, date, introduction, phone, 'teacher' as type
         FROM teachers 
         WHERE username = ?)
        UNION ALL
        (SELECT name, subject, grade, date, introduction, phone, 'student' as type
         FROM students 
         WHERE username = ?);
    `;

    // 执行查询
    connection.query(sqlStr, [username, username], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            res.status(500).send('Database query failed');
            return;
        }
        console.log('Query results:', results);
        res.json(results);
    });
});
//以下为个人中心-我的发布-删除功能后端代码
/*
* 记录几个错误
* 1.多个参数使用post传递，前后端方法一致，注意前端端口手动输入
* 2.data内存放发给后端的参数，不要发字典类型，在前端就拆开，不然识别不出来
* 3.不需要通过req.body.username访问参数，直接req.username
* */
routeReg.post('/api/delete-post', (req, res) => {
    var body = ""
    req.on('data', function (chunk) {
        body += chunk;
    })

    req.on('end', function () {
        // 解析参数
        body = querystring.parse(body);
        // 设置响应头部信息及编码
        // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});

        if(body.username && body.subject && body.grade && body.name && body.phone && body.date && body.introduction) { // 输出提交的数据
    // const item = req.item;
    // console.log("item.name:",item.name);
    let sql;
    if(body.type === "teacher")
    {sql = 'DELETE FROM teachers WHERE username = ? AND name = ? AND subject = ? AND grade = ? AND date = ? AND introduction = ? AND phone = ?' ;}
    else {sql = 'DELETE FROM students WHERE username = ? AND name = ? AND subject = ? AND grade = ? AND date = ? AND introduction = ? AND phone = ?';}
    connection.query(sql, [body.username, body.name, body.subject, body.grade, body.date, body.introduction, body.phone], (err, results) => {

        if (err) {
            console.error('数据库删除失败:', err);
            res.status(500).send('数据库删除失败');
        } else {
            console.log(sql);
            console.log('删除成功');
            res.json('删除成功'); // 或者返回其他成功信息
        }

    });}});
});
