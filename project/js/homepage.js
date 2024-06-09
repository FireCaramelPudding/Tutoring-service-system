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
    
})