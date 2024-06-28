function deletePost(name,subject,grade,date,introduction,phone,type)
{
    const username = localStorage.getItem('username');
    console.log("用户名是:", username);
    console.log("姓名是:", name);
    console.log("科目是:", subject);
    console.log("年级是:", grade);
    console.log("日期是:", date);
    console.log("简介是:", introduction);
    console.log("电话是:", phone);
    console.log("类型是:", type);
    $.ajax({
        url: `http://127.0.0.1/api/delete-post`,
        type: "POST",
        dataType: "json",
        data: {
            username: username,
            name: name,
            subject: subject,
            grade: grade,
            phone: phone,
            introduction:introduction,
            date:date,
            type:type
        },
        success: function (response) {
            // 删除成功后重新加载发布信息
            layui.layer.msg('删除成功')
            setTimeout(function () {window.location.reload();},1000);
            fetchData(); // 重新加载数据
        },
        error: function (xhr, status, error) {

            console.log(error)
            console.error('删除失败:', error);
            layui.layer.msg('删除失败，请重试');
        }
    });
}