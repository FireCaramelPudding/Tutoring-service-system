$(function() {
    //点击“发布”的链接
    $("#fabu").on('click',function(){
        $('#body1').show()
        $('#body2').hide()
    })

    //点击“查找”的链接
    $("#chazhao").on('click',function(){
        $('#body1').hide()
        $('#body2').show()
    })
    
    //从layui 中获取form 对象
    var form =layui.form 
    var layer = layui.layer

    //监听学生表单的提交事件
    $('#form_students').on('submit',function(e){
        layer.msg('准备提交数据')
        e.preventDefault();
        const username = localStorage.getItem('username');

        var data= {username,subject:$('#form_students [name=xueke]').val(),grade:$('#form_students [name=nianji]').val(),
            name:$('#form_students [name=xingming]').val(),phone:$('#form_students [name=phone]').val(),
            date:$('#form_students [name=date]').val(),introduction:$('#form_students [name=jianjie]').val()}
       
        $.ajax({
            url:"http://127.0.0.1/api/students",
            type:"POST",
            data:{username,subject:$('#form_students [name=xueke]').val(),grade:$('#form_students [name=nianji]').val(),
                name:$('#form_students [name=xingming]').val(),phone:$('#form_students [name=phone]').val(),
                date:$('#form_students [name=date]').val(),introduction:$('#form_students [name=jianjie]').val()},
            success: function (data) {
                console.log('receive data is ',data)
                if (data=="msg:学生信息提交成功") {
                    layer.msg("提交成功")
                    setTimeout(function() {
                        window.location.reload();
                        $('#chazhao').click();
                    }, 1000);
                }
                else if (data=="msg:信息重复！") {
                    layer.msg("信息重复！")
                }
                else {
                    console.log('receive data is ',data)
                }
            },
            error: function(res) {
                console.log(res)
                layer.msg('出错了')
            },
        })
               
    })

    //监听家教表单的提交事件
    $('#form_teachers').on('submit',function(e){
        layer.msg('准备提交数据')
        e.preventDefault();
        const username = localStorage.getItem('username');

        var data= {username,subject:$('#form_teachers [name=xueke]').val(),grade:$('#form_teachers [name=nianji]').val(),
            name:$('#form_teachers [name=xingming]').val(),phone:$('#form_teachers [name=phone]').val(),
            date:$('#form_teachers [name=date]').val(),introduction:$('#form_teachers [name=jianjie]').val()}
       
        $.ajax({
            url:"http://127.0.0.1/api/teachers",
            type:"POST",
            data:{username,subject:$('#form_teachers [name=xueke]').val(),grade:$('#form_teachers [name=nianji]').val(),
                name:$('#form_teachers [name=xingming]').val(),phone:$('#form_teachers [name=phone]').val(),
                date:$('#form_teachers [name=date]').val(),introduction:$('#form_teachers [name=jianjie]').val()},
            success: function (data) {
                console.log('receive data is ',data)
                if (data=="msg:家教信息提交成功") {
                    layer.msg("提交成功")
                    $('#chazhao').click()
                }
                else if (data=="msg:信息重复！") {
                    layer.msg("信息重复！")
                }
                else {
                    console.log('receive data is ',data)
                }
            },
            error: function(res) {
                console.log(res)
                layer.msg('出错了')
            },
        })
               
    })

// 定义一个函数来获取数据(学生推荐)
function fetchData_s() {
    const username = localStorage.getItem('username');
    // 使用jQuery的Ajax方法从后端获取数据
    $.ajax({
        url: "http://127.0.0.1/api/s_getData", 
        type: "POST",
        data:{username:username},
        //dataType: "json", // 期望从服务器返回的数据类型
        success: function(data) {
            if(data){
                console.log('Received data:', data);
                displayData_s(data);
            }
            
        },
        error: function(res) {
            // 请求失败，处理错误
            console.log(res);
            layer.msg('出错了');
        }
    });
}

// 定义一个函数来获取数据(老师推荐)
function fetchData_t() {
    const username = localStorage.getItem('username');
    // 使用jQuery的Ajax方法从后端获取数据
    $.ajax({
        url: "http://127.0.0.1/api/t_getData", 
        type: "POST",
        data:{username:username},
        //dataType: "json", // 期望从服务器返回的数据类型
        success: function(data) {
            if(data){
                console.log('Received data:', data);
                displayData_t(data);
            }
            
        },
        error: function(res) {
            // 请求失败，处理错误
            console.log(res);
            layer.msg('出错了');
        }
    });
}

// 定义一个函数来显示学生推荐数据
function displayData_s(data) {
    console.log('tuijain data',data)
    if(data=="msg:无推荐")
        {
            const container = $("#data-container_s"); // 页面上一个id为data-container的元素
            container.empty(); // 清空现有内容
            const element = $("<div>").addClass("layui-panel").text(`无推荐`); // 创建新的元素并设置文本
            container.append(element); // 将新元素添加到容器中
            return
        }
    if(data=="未找到学生信息")
            {
                const container = $("#data-container_s"); // 页面上一个id为data-container的元素
                container.empty(); // 清空现有内容
                const element = $("<div>").addClass("layui-panel").text(`请先发布信息`); // 创建新的元素并设置文本
                container.append(element); // 将新元素添加到容器中
                return
            }
            
    if(data=="msg:未找到教师"){
        const container = $("#data-container_s"); // 页面上一个id为data-container的元素
            container.empty(); // 清空现有内容
            const element = $("<div>").addClass("layui-panel").text(`没有符合条件的家教`); // 创建新的元素并设置文本
            container.append(element); // 将新元素添加到容器中
    }
    else {
        // 返回的数据是一个数组，我们将其显示在页面上
        const container = $("#data-container_s"); // 页面上一个id为data-container的元素
        container.empty(); // 清空现有内容

        for (let i = data.length - 1; i >= 0; i--) {
            const item = data[i];
            const element = $("<div>").addClass("layui-panel").html(`
                <span>ID：</span>
                <div class="ID" style="display: inline;">${item.username}</div><br>

                <span>科目：</span>
                <div class="subject" style="display: inline;">${item.subject}</div><br>

                <span>年级：</span>
                <div class="grade" style="display: inline;">${item.grade}</div><br>

                <span>姓名：</span>
                <div class="name" style="display: inline;">${item.name}</div><br>

                <span>电话：</span>
                <div class="phone" style="display: inline;">${item.phone}</div><br>

                <span>日期：</span>
                <div class="date" style="display: inline;">${item.date}</div><br>

                <span>简介：</span>
                <div class="introduction" style="display: inline;">${item.introduction}</div>
            `).on('click', panelClicked); // 创建新的元素并设置文本
        
            container.append(element); // 使用prepend将新元素添加到容器的开头
        }
    }
}



// 定义一个函数来显示老师推荐数据
function displayData_t(data) {
    console.log('jiaoshi:',data)
    if(data=="msg:无推荐")
        {
            const container = $("#data-container_t"); // 页面上一个id为data-container的元素
            container.empty(); // 清空现有内容
            const element = $("<div>").addClass("layui-panel").text(`无推荐`); // 创建新的元素并设置文本
            container.append(element); // 将新元素添加到容器中
            return
        }
        if(data=="msg:未找到教师信息")
            {
                const container = $("#data-container_t"); // 页面上一个id为data-container的元素
                container.empty(); // 清空现有内容
                const element = $("<div>").addClass("layui-panel").text(`请先发布信息`); // 创建新的元素并设置文本
                container.append(element); // 将新元素添加到容器中
                return
            }
    if(data=="msg:未找到学生"){
        const container = $("#data-container_t"); // 页面上一个id为data-container的元素
            container.empty(); // 清空现有内容
            const element = $("<div>").addClass("layui-panel").text(`没有符合条件的学生`); // 创建新的元素并设置文本
            container.append(element); // 将新元素添加到容器中
    }
    else{
        // 返回的数据是一个数组，我们将其显示在页面上
        const container = $("#data-container_t"); // 页面上一个id为data-container的元素
        container.empty(); // 清空现有内容

        for (let i = data.length - 1; i >= 0; i--) {
            const item = data[i];
            const element = $("<div>").addClass("layui-panel").html(`
                ID：${item.username}<br>
                科目：${item.subject}<br>
                年级：${item.grade}<br>
                姓名：${item.name}<br>
                电话：${item.phone}<br>
                日期：${item.date}<br>
                简介：${item.introduction}
            `); // 创建新的元素并设置文本
        
            container.append(element); // 使用prepend将新元素添加到容器的开头
        }
    }
}

$('#form_comment').on('submit',function(e){
    layer.msg('准备提交数据')
    e.preventDefault();
    const username = localStorage.getItem('username');
    const t_username = localStorage.getItem('t_username');
    const teachername = localStorage.getItem('name');
    var data= {username:t_username,teachername: teachername,studentname:username,comment:$('#form_comment [name=liuyan]').val()}
    console.log(data)
   
    $.ajax({
        url:"http://127.0.0.1/api/comment",
        type:"POST",
        data:{username:t_username,teachername:teachername,studentname:username,comment:$('#form_comment [name=liuyan]').val()},
        success: function (data) {
            console.log('receive data is ',data)
            if (data=="msg:评论信息提交成功") {
                layer.msg("评论信息提交成功")
                setTimeout(function() {
                    window.location.reload();
                }, 1000); // 1000 表示延迟 1 秒刷新w
            }
            else if (data=="msg:评论信息未提交") {
                layer.msg("评论信息未提交")
            }
            else {
                console.log('receive data is ',data)
            }
        },
        error: function(res) {
            console.log(res)
            layer.msg('出错了')
        },
    })
           
})


function fetchComment() {
    // 使用jQuery的Ajax方法从后端获取数据
 
    const username = localStorage.getItem('t_username');
    const teachername = localStorage.getItem('name');
    $.ajax({
        url: "http://127.0.0.1/api/getComment/", // 替换为实际的后端API地址
        type: "GET",
        data: {username:username,
               teachername:teachername
        },
        dataType: "json", // 期望从服务器返回的数据类型
        success: function(data) {
            // 请求成功，处理返回的数据
            console.log('Received data:', data);
            displayComment(data); // 显示数据的函数
        },
        error: function(xhr, status, error) {
            // 请求失败，处理错误
            console.error('An error occurred:', error);
            layui.layer.msg('数据加载失败'); 
        }
    });
}

// 定义一个函数来显示数据
function displayComment(data) {
    // 假设返回的数据是一个数组，我们将其显示在页面上
    const container = $("#data-comment"); // 假设页面上有一个id为data-container的元素
    container.empty(); // 清空现有内容
    data.forEach(item => {
        const element = $("<div>").text(`${item.student}: ${item.comment}`); // 创建新的元素并设置文本
        container.append(element); // 将新元素添加到容器中
    });
}

$(document).ready(function() {
    fetchData_s();
});
$(document).ready(function() {
    fetchData_t();
    fetchComment();
});

//监听学生查找的提交事件
$('#students_search').on('submit',function(e){
    // layer.msg('准备提交数据')
    e.preventDefault();
    var data = {};
    var subject = $('#students_search [name=xueke]').val()
    var grade = $('#students_search [name=nianji]').val()
    var date = $('#students_search [name=date]').val()
    var teacher = $('#students_search [name=xingming]').val()
    if (subject) { 
        data.subject = subject;
    }
    if (grade) {
        data.grade = grade;
    }
    if (date) {
        data.date = date;
    }
    if (teacher) {
        data.name = teacher;
    }
    if(Object.keys(data).length === 0){
        return layer.msg('不能全为空！')
    }
    
    $.ajax({
        url:"http://127.0.0.1/api/s_search",
        type:"POST",
        data:data,
        success: function (data) {
            if(data){
                console.log('Received data:', data);
                displayData_s(data);
            }
        },
        error: function(res) {
            console.log(res)
            layer.msg('出错了')
        },
    })
           
})

//监听老师查找的提交事件
$('#teachers_search').on('submit',function(e){
    // layer.msg('准备提交数据')
    e.preventDefault();
    var data = {};
    var subject = $('#teachers_search [name=xueke]').val()
    var grade = $('#teachers_search [name=nianji]').val()
    var date = $('#teachers_search [name=date]').val()
    if (subject) { 
        data.subject = subject;
    }
    if (grade) {
        data.grade = grade;
    }
    if (date) {
        data.date = date;
    }
    if(Object.keys(data).length === 0){
        return layer.msg('不能全为空！')
    }
    
    $.ajax({
        url:"http://127.0.0.1/api/t_search",
        type:"POST",
        data:data,
        success: function (data) {
            if(data){
                console.log('Received data:', data);
                displayData_t(data);
            }
        },
        error: function(res) {
            console.log(res)
            layer.msg('出错了')
        },
    })
           
})

});

