(function($) {
	function showInfo(target) {
		var opts = $.data(target, 'pagination').options;
		var total = opts.data[opts.adapter.total]||opts.total;
		var pageSize = opts.data[opts.adapter.pageSize]||opts.pageSize;
		var pageNumber = parseInt(opts.data[opts.adapter.pageNumber]||opts.pageNumber);
		var pageCount = Math.ceil(total / pageSize) || 1;
		//总页数显示
		if(opts.style=="normal"){
			$(target).addClass("page-content").empty();
			var gl = '<div class="page-content-total">共<span>'+pageCount+'</span>页';
			if(opts.showTotol) gl+='<span>'+total+'</span>条记录';
				gl+='</div>';
			$(gl).appendTo(target);
		}else if(opts.style=="easy"){
			$(target).addClass("page-content easy-page-content").empty();
		}
		
		var firstPage = $('<div class="page-content-first" title="第一页"></div>');
		if(total > 0 && pageNumber > 1){
			firstPage.bind("click",function(){
				opts.onSelectPage(1);
			}).addClass("cursor");
		}
		//firstPage.appendTo(target);
		var prevPage = $('<div class="page-content-previous" title="上一页"></div>');
		if(pageNumber > 1){
			prevPage.bind("click",function(){
				opts.onSelectPage(pageNumber-1);
			}).addClass("cursor");
		}
		prevPage.appendTo(target);
		var startPage = pageNumber%5>0 ? (pageNumber-pageNumber%5+1):(pageNumber-4);
		var endPage = (startPage+4)<pageCount ? (startPage+4):pageCount;
		for(var i=0;i<5;i++){
			var page = $('<div class="page-content-number">'+(startPage > endPage ?"":startPage)+'</div>');
			if(startPage == pageNumber)  page.addClass("current");
			if(startPage <= endPage){
				page.bind("click",function(){
					opts.onSelectPage($(this).attr("pageNum"));
				}).addClass("cursor").attr("pageNum",startPage);
			}
			page.appendTo(target);
			startPage++;
		}
		var nextPage = $('<div class="page-content-next" title="下一页"></div>');
		if(pageNumber < pageCount){
			nextPage.bind("click",function(){
				opts.onSelectPage(pageNumber+1);
			}).addClass("cursor");
		}
		nextPage.appendTo(target);
		var lastPage = $('<div class="page-content-end" title="最后一页"></div>');
		if(pageNumber < pageCount){
			lastPage.bind("click",function(){
				opts.onSelectPage(pageCount);
			}).addClass("cursor");
		}
		//lastPage.appendTo(target);
		//可输入跳转
		if(opts.style=="normal"){
			var gotoPage = $('<div class="page-content-jump">跳转到<span class="jumpspan"><input type="text" class="jumpinput" value="1" maxlength="3"/></span>页</div>');
			gotoPage.find(".jumpinput").val(pageNumber).unbind("keydown").keydown(function(e){
				var code = e.keyCode;
				if(code=="13"){
					var pageIndex = $(this).val();
					if(pageIndex !="" && !isNaN(pageIndex)){
						goToPageNum = parseInt(pageIndex);
						if(!(/^[1-9][\d]*$/.test(pageIndex))){
							alert("跳转页数须为正整数！");
							return;
						}
						if(goToPageNum > pageCount){
							alert("跳转页数不能大于总页数！");
							return;
						}
						opts.onSelectPage(goToPageNum);
					}
				}
			});
			gotoPage.appendTo(target);
		}
	}
	$.fn.pagination = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.pagination.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
					var opts = $.extend({}, $.fn.pagination.defaults, options);
					$.removeData(this, 'pagination');
					$.data(this, 'pagination', { options : opts });
					showInfo(this);
				});
	};
	$.fn.pagination.methods = {
		options : function(jq) {
			return $.data(jq[0], 'pagination').options;
		},
		goPage : function(jq,pageNumber) { //页面跳转
			return jq.each(function() {
				      $.data(this, 'pagination').options.onSelectPage(pageNumber);
					});
		},
		load : function(jq) { //刷新当前页
			return jq.each(function() {
				   var opts = $.data(this, 'pagination').options;
				   var pageNumber = opts.data[opts.adapter.pageNumber]||opts.pageNumber;
			       opts.onSelectPage(pageNumber);
				});
		},
		reload : function(jq) { //刷新到第一页
			return jq.each(function() {
			       $.data(this, 'pagination').options.onSelectPage(1);
				});
		}
	};
	$.fn.pagination.defaults = {
		total : 0,//总记录
		pageSize : 10,//默认每页数量
		pageNumber : 1,//当前页码
		showTotol : true,//是否显示总页数
		data : {},//存放分页的数据
		adapter : { total:"total",pageSize:"size" ,pageNumber:"currentPageNo"},//适配数据器
		style:"normal",//分页样式 默认为正常的 可选简单 easy
		onSelectPage : function(pageNumber) {
		}
	};
})(jQuery);

