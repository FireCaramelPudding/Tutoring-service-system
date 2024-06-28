

$(function() {
    //点击“去注册”的链接
    $("#link_reg").on('click',function(){
        $('.login-box').hide()
        $('.reg-box').show()
        $('.ch-box').hide()
    })

    //点击“登录”的链接
    $("#link_login").on('click',function(){
        $('.login-box').show()
        $('.reg-box').hide()
        $('.ch-box').hide()
    })
    
    //点击“修改”的链接
    $("#link_ch").on('click',function(){
        $('.login-box').hide()
        $('.reg-box').hide()
        $('.ch-box').show()
    })

    //从layui 中获取form 对象
    var form =layui.form 
    var layer = layui.layer
    //未捕获到数据内容
    //通过form.verify函数自定义校验规则
    // form.verity({        
    //     pwd:[/^[\S]{6,12}$/,'密码必须6到12位，且不能出现空格'],
    //     repwd:function(value){
    //         // 校验两次密码是否一致
    //         var pwd=$('#form-box [name=password]')
    //         if (pwd!=value){
    //             return '两次密码不一致'
    //         }
    //     }
    // })
    
    
    //监听注册表单的提交事件
    $('#form_reg').on('submit',function(e){
        //layer.msg('进行注册表单，准备提交注册数据')
        e.preventDefault();
        var patt = /[/^[\S]{6,12}$/;
        password = $('#form_reg [name=password]').val()
        if(!patt.test(password)) { 
          return layer.msg('密码必须6到12位，且不能出现空格')
        }
        if(password!=$('#form_reg [name=repassword]').val()) { 
            return layer.msg('两次密码输入不一致，请重新输入')
          }

        var data= {username:$('#form_reg [name=username]').val(),password:$('#form_reg [name=password]').val()}
        console.log('username is  ',$('#form_reg [name=username]').val())
        console.log('password is  ',$('#form_reg [name=password]').val())
        //$.post('http://ajax.frontend.itheima.net/api/reguser',data,function(res){
        $.ajax({
            url:"http://127.0.0.1:3380/api/reguser",
            type:"POST",
            data:{username:$('#form_reg [name=username]').val(),password:$('#form_reg [name=password]').val()},
            success: function (data) {
                console.log('receive data is ',data)
                if (data=="msg:注册成功") {
                    layer.msg("注册成功,请登录")
                    $('#link_login').click()
                }
                else if (data=="msg:用户名被占用，请更换其他用户名！") {
                    layer.msg("该用户已注册,请更换用户名注册")
                }
                else {
                    console.log('receive data is ',data)
                }
            },
            error: function(res) {
                console.log(res)
                layer.msg('注册失败，出错了')
            },
        })
               
    })

    //var fs=require('fs')
    //监听登录事件
    $('#form_login').on('submit',function(e){
        layer.msg('进行登录操作，准备提交登录数据')
        e.preventDefault();
        //检查密码长度，'密码必须6到12位，且不能出现空格'
        var patt = /[/^[\S]{6,12}$/;
        password = $('#form_login [name=password]').val()
        username = $('#form_login [name=username]').val()
        if(!patt.test(password)) { 
          return layer.msg('密码必须6到12位，且不能出现空格')
        }

        hash1 = Sha256Encrypt(username + password)
        auth = generateAuthCode()
        hash2 = Sha256Encrypt(hash1 + auth)

        var data = {username:$('#form_login [name=username]').val(),password:$('#form_login [name=password]').val(),auth,hash2}
        console.log('username is  ',$('#form_login [name=username]').val())
        console.log('password is  ',$('#form_login [name=password]').val())
        $.ajax({
            url:'http://127.0.0.1:3380/api/login',
            method: 'POST',
            data:{username:$('#form_login [name=username]').val(),password:$('#form_login [name=password]').val(),auth,hash2},
            //dataType: 'json',
            
            success: function (data) {
                console.log(data)
                if(data.suc == "msg:查询到该用户名,登录成功！"){
                    localStorage.setItem('username', data.username);
                    //var data1 = encryptDecrypt(data.ciphertext,hash1,false)
                    //var blob = new Blob([data1], {type: "text/plain;charset=utf-8"});
                    
                    // 创建一个新的 a 元素
                    //var elem = window.document.createElement('a');
                    //elem.href = window.URL.createObjectURL(blob);
                    //elem.download = "output.txt"; // 设置你想要的文件名
                    //document.body.appendChild(elem);
                    //elem.click(); // 模拟点击以开始下载
                    //document.body.removeChild(elem); 
                    
                    layer.msg("登录成功,进入首页")
                   
                    location.href= 'homepage.html'
                    //$('#link_login').click()
                
                    }
                else{
                    console.log('receive data is ',data)
                    layer.msg("登录失败,用户名或密码错误")
                }
            },
            error: function(res) {
                console.log(res)
                layer.msg('登录失败，出错了')
            },           
        })    
        
    })

    //监听修改事件
    $('#form_ch').on('submit',function(e){
        layer.msg('进行修改操作，准备提交修改数据')
        e.preventDefault();
        //检查密码长度，'密码必须6到12位，且不能出现空格'
        var patt = /[/^[\S]{6,12}$/;
        oldpassword = $('#form_ch [name=oldpassword]').val()
        newpassword = $('#form_ch [name=newpassword]').val()
        username = $('#form_ch [name=username]').val()
        if(!patt.test(oldpassword)) {
          return layer.msg('密码必须6到12位，且不能出现空格')
        }
        
        hash1 = Sha256Encrypt(username + oldpassword)
        auth = generateAuthCode()
        hash2 = Sha256Encrypt(hash1 + auth)
        
        var data= {username:$('#form_ch [name=username]').val(),oldpassword:$('#form_ch [name=oldpassword]').val(),newpassword:$('#form_ch [name=newpassword]').val(),auth,hash2}
        console.log('username is  ',$('#form_ch [name=username]').val())
        console.log('password is  ',$('#form_ch [name=password]').val())
        $.ajax({
            url:'http://127.0.0.1:3380/api/change',
            method: 'POST',
            data:{username:$('#form_ch [name=username]').val(),oldpassword:$('#form_ch [name=oldpassword]').val(),newpassword:$('#form_ch [name=newpassword]').val(),auth,hash2},
            //dataType: 'json',
            success: function (data) {
                console.log(data)
                if(data == "msg:查询到该用户名,修改成功！"){
                    
                    //text = decrypt(data.ciphertext,hash1)
                    /*fs.writeFile('output.txt', text, (err) => {
                        if (err) throw err;
                        console.log('The file has been saved!');
                      });*/
                    layer.msg("修改成功,进入首页")
                   
                    location.href= 'index.html'
                    //$('#link_login').click()
                
                    }
                else{
                    console.log('receive data is ',data)
                    layer.msg("修改失败,用户名或密码错误")
                }
            },
            error: function(res) {
                console.log(res)
                layer.msg('修改失败，出错了')
            },           
        })          
    })

    
    //认证码生成
    function generateAuthCode() {
    let code = '';
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charLength = chars.length;
   
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * charLength));
    }
   
    return code;
    }

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

    // 解密函数
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
})

