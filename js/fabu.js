//展示个人发布
$(function() {
    // 页面加载完成后执行
    fetchData();

    // 点击“我的发布”菜单项时执行
    $('#chazhao').click(function () {
        $('#body1').hide();  // 隐藏基本信息区域
        $('#body2').show();  // 显示我的发布区域
        fetchData();         // 重新加载发布信息
    });

    // 函数来获取用户的发布信息
    function fetchData() {
        const username = localStorage.getItem('username');
        if (!username) {
            // 如果用户未登录，提示用户登录
            alert('请先登录！');
            return;
        }
        console.log(`Sending request for username: ${username}`);
        $.ajax({
            // url: `http://127.0.0.1/api/my-posts?username=${username}`, // 包含用户名的URL
            url: `http://127.0.0.1:3380/api/my-posts`,
            type: "GET",
            dataType: "json", // 期望从服务器返回的数据类型
            data:{username:username},
            success: function (data) {
                // 请求成功，处理返回的数据
                console.log('Received data:', data);
                displayData(data); // 显示数据的函数
            },
            error: function (xhr, status, error) {
                // 请求失败，处理错误
                // console.log(xhr.responseText);
                console.error('Request failed:', xhr.responseText);
                console.error('An error occurred:', error);
                layui.layer.msg('数据加载失败，请重试');
            }
        });
    }

    // 定义一个函数来显示数据
    function displayData(data) {
        const container = $("#posts-container"); // 获取容器

        // 清空现有内容
        container.empty();

        // 遍历查询结果
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            // 创建一个新的块元素
            const postElement = $('<div class="post">');

            // 添加每条记录的内容
            postElement.append(
                $('<p style="color: #00FF00">').text(`姓名: ${item.name}`),
                $('<p>').text(`学科: ${item.subject}`),
                $('<p>').text(`年级: ${item.grade}`),
                $('<p>').text(`时间: ${item.date}`),
                $('<p>').text(`个人简介: ${item.introduction}`),
                $('<p>').text(`手机号: ${item.phone}`),
                $('<button>').text('删除').click(() => deletePost(item.name,item.subject,item.grade,item.date,item.introduction,item.phone,item.type)), // 添加删除按钮并绑定点击事件
                $('<fieldset class="layui-elem-field layui-field-title" style="margin-top: 30px;">')
            );
            console.log("item is :",item);

            // 将块元素添加到容器中
            container.append(postElement);
        }
    }

});


