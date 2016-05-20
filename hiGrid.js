(function($) {
	$.fn.hiGrid = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.hiGrid.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
					var opts = $.extend({}, $.fn.hiGrid.defaults, options);
					opts.selCls = opts.singleSelect ? "sel" : "select";
					$.data(this, 'hiGrid', { options : opts });
					showInfo(this);
				});
	};
	function showInfo(target) {
		var opts = $.data(target, 'hiGrid').options;
		if(!opts.url) return alert("url can not be empty!");
		if(!opts.columns || opts.columns.length == 0) return alert("columns can not be empty!");
		_d3f9(target,opts);
		_ldg2(target,opts,1);
	}
	function _ldg2(target,opts,pageNumber){
		if(opts.loading) $(target).showLoading();
		if(opts.pageCount){
			opts.param["page.start"] = pageNumber;
			opts.param["page.limit"] = opts.pageSize;
		}else{
			opts.param["page.start"] = (pageNumber-1)*opts.pageSize;
			opts.param["page.limit"] = opts.pageSize;
		}
		opts.pageNumber = pageNumber;
		$.data(target, 'hiGrid', { options : opts });
		if(opts.url instanceof Array){
			if(opts.url.length == 0){
				$(target).html("<span style='margin:20px;color:#6a727f;'>"+opts.emptyMsg+"</span>");
				opts.onLoadSuccess(opts.url);
				if(opts.loading) $(target).hideLoading();
				return;
			}
			$.data(target, 'hiGridData', opts.url);
			var data = {rows:opts.url,totol:opts.url.length};
			_d87g(target,data,opts,pageNumber);
			opts.onLoadSuccess(opts.url);
			if(opts.loading) $(target).hideLoading();
		}else{
			$.ajax({
				url : opts.url,
				type :  opts.method,
				dataType : 'json',
				async : opts.async,
				data : opts.param,
				success:function(resp){
					if(opts.loading) $(target).hideLoading();
					var data = opts.formatData(resp);
					if(!data.success){
						$(target).html("<span style='margin:20px;color:red;'>"+opts.errorMsg+"</span>");
						opts.onLoadSuccess(resp);
						return;
					}
					if(!data.rows || data.rows.length == 0){
						$(target).html("<span style='margin:20px;color:#6a727f;'>"+opts.emptyMsg+"</span>");
						opts.onLoadSuccess(resp);
						return;
					}
					$.data(target, 'hiGridData', data.rows);
					_d87g(target,data,opts,pageNumber);
					opts.onLoadSuccess(resp);
				},
				error:function(data){
					if(opts.loading) $(target).hideLoading();
					opts.onLoadError(data);
				}
			});
		}
	}
	function _d87g(target,data,opts,pageNumber){
		var bb = [];
		$.each(data.rows,function(i,v){
			bb.push('<tr data-index="'+i+'" class="'+(i%2==0?"":opts.trevenCls)+'">');
			_dd6l(bb,opts,v,i);
			bb.push('</tr>');
		});
		if(opts.isFilled){
			var startIndex = data.rows.length;
				for(var n = startIndex;n < opts.pageSize; n++){
				bb.push('<tr data-index="-1" class="'+(n%2==0?"":opts.trevenCls)+'">');
				if(opts.showCheck)  bb.push('<td  width="42px" align="center"></td>');
				if(opts.showLineNumber)  bb.push('<td  width="42px" align="center">'+(n+1)+'</td>');
			    $.each(opts.columns,function(i,v){
			    	v.hidden = v.hidden||false;
			    	if(!v.hidden){
						bb.push('<td> </td>');
			    	}
				});
				bb.push('</tr>');
			}
		}
		$(target).find('tbody').html(bb.join(""));
		if(opts.pagination){
			$(target).find('#hiGrid_pagination').pagination({
				total : data["total"]||0,
				pageSize : opts.pageSize,
				pageNumber : pageNumber,
				showTotol : opts.showTotol,
				style:opts.paginationStyle,
	    		onSelectPage:function(pageNum){
		    		$(target).hiGrid("goPage",pageNum);
	    	}});
		}
		if(data.rows.length > 0){
			if(opts.showCheck){
				_ade1(target,opts);
			} 
			_ade2(target);
			_ade3(target,opts);
			if(opts.firstClick){
				$(target).find('tbody tr td:first').click();
			}
		}
	}
	function _ade1(target,opts){
		$(target).find("[name='hiGirdAllCheck']").bind("click.hiGrid",function(e){
			$(target).find("[name='hiGirdCheck']").attr("checked",this.checked);
			var data = $.data(target, 'hiGridData');
			if(this.checked){
				$(target).find("tbody tr[data-index!='-1']").addClass(opts.selCls);
				opts.onSelectAll(data);
			}else{
				$(target).find("tbody tr").removeClass(opts.selCls);
				opts.onUnselectAll(data);
			}
		});
		$(target).find("[name='hiGirdCheck']").bind("click.hiGrid",function(e){
			var tr = $(this).parent("td").parent("tr");
			var data = $.data(target, 'hiGridData');
			var index = tr.attr("data-index");
			if(this.checked){
				if(opts.singleSelect)
					$(target).find("tbody tr."+opts.selCls).removeClass(opts.selCls).find("[name='hiGirdCheck']:checked").attr("checked",false);
				tr.addClass(opts.selCls);
				opts.onSelectRow(index,data[index]);
			}else{
				tr.removeClass(opts.selCls);
				opts.onUnselectRow(index,data[index]);
			}
			if($(target).find("tbody tr."+opts.selCls).size()==data.length){
				$(target).find("[name='hiGirdAllCheck']").attr("checked",true);
			}else{
				$(target).find("[name='hiGirdAllCheck']").attr("checked",false);
			}
			e.stopPropagation();
		});
	}
	function _ade2(target){
		$(target).find("tr:even").addClass("ghcolor");
		$(target).find("tbody tr").hover(function(){
    				$(this).children("td").addClass("hcolor");
    			},function(){
    				$(this).children("td").removeClass("hcolor");
    	});
	}
	function _ade3(target,opts){
		$(target).find('tbody td').bind("click.hiGrid",function(e){
			var self = this;
			if($(self).is("td")) self = $(this).parent("tr");
			var el = e.srcElement?e.srcElement:e.target; 
			if(el.name=='hiGirdCheck') return;
			var index = $(self).attr("data-index");
			var data = $.data(target, 'hiGridData');
			if(index == -1) return;
			if(opts.singleSelect){
				$(target).find("tbody tr."+opts.selCls).removeClass(opts.selCls);
				$(self).addClass(opts.selCls);
				if(opts.showCheck){
					$(target).find("[name='hiGirdCheck']").attr("checked",false);
					$(self).find("[name='hiGirdCheck']").attr("checked",true);
				}
				opts.onSelectRow(index,data[index]);
			}else{
				if($(self).hasClass(opts.selCls)){
					$(self).removeClass(opts.selCls);
					$(self).find("[name='hiGirdCheck']").attr("checked",false);
					opts.onUnselectRow(index,data[index]);
				}else{
					$(self).addClass(opts.selCls);
					$(self).find("[name='hiGirdCheck']").attr("checked",true);
					opts.onSelectRow(index,data[index]);
				}
			}
			if(opts.showCheck){
				if($(target).find("tbody tr."+opts.selCls).size()==data.length){
					$(target).find("[name='hiGirdAllCheck']").attr("checked",true);
				}else{
					$(target).find("[name='hiGirdAllCheck']").attr("checked",false);
				}
			}
			opts.onClickRow(index,data[index]);
		});
	}
	
	function _dd6l(bb,opts,data,n){
		if(opts.showCheck){
			bb.push('<td  width="42px" align="center"><input name="hiGirdCheck" data-index="'+n+'" type="checkbox" /></td>');
		}
		if(opts.showLineNumber)  bb.push('<td  width="42px" align="center">'+(n+1)+'</td>');
	    $.each(opts.columns,function(i,v){
	    	v.hidden = v.hidden||false;
	    	if(!v.hidden){
				bb.push('<td align="'+(v.align||"left")+'" class="'+(v.cls||"")+'"');
				v.showTitle = v.showTitle||false;
				var name = data[v.dataIndex]||"";
				if(typeof v.render == 'function') name = v.render(n,name,data);
				if(v.showTitle)  bb.push(' title="'+name+'"');
				bb.push('>');
				bb.push(name);
				bb.push('</td>');
	    	}
		});
	}
	function _d3f9(target,opts){
		var gg = [];
		var width = ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) ? "99%":"100%";
		gg.push('<table cellpadding="0" cellspacing="0" width="'+width+'" class="'+opts.tableCls+'">');
		gg.push('<thead><tr>');
		if(opts.showCheck){
			gg.push('<td  width="42px" align="center">');
			if(!opts.singleSelect)
				gg.push('<input name="hiGirdAllCheck" type="checkbox" />');
			gg.push('</td>');
		}
		if(opts.showLineNumber)  gg.push('<td  width="42px" align="center">行号</td>');
		$.each(opts.columns,function(i,v){
			v.hidden = v.hidden||false;
			if(!v.hidden) gg.push('<td  width="'+(v.width||"15%")+'" align="'+(v.align||"left")+'">'+(v.name||"")+'</td>');
		});
		gg.push('</tr></thead>');
		gg.push('<tbody>');
		gg.push('</tbody>');
		gg.push('</table>');
		if(opts.pagination)  gg.push('<div id="hiGrid_pagination"></div>');
		$(target).empty().html(gg.join(""));
	}
	
	
	$.fn.hiGrid.defaults = {
			pageNumber : 1,//当前页
			pageSize : 20,//页数
			total : 0,//总数
		    url : undefined,//url
		    param : {},//传递参数
		    columns : null,//需要展示的列 
		    selCls : "select",//行选中的样式
		    errorMsg : "服务器返回错误！",//错误信息
		    emptyMsg : "没有查询到信息！",//没查询到数据信息
		    loading : true,//是否有加载数据的等待
		    method : 'POST',//数据提交方法
		    isFilled : false,//记录数不足页数，空行补齐
		    firstClick : true,//是否触发第一行点击事件
		    showCheck : false,//显示checkbox选择
			singleSelect : true,//是否单选
			pagination : false,//是否支持分页
			paginationStyle :"normal",//分页styel默认为正常的 normal  可选 简单 easy
			showLineNumber : false,//是否显示行号
			showTotol : true,//是否显示总页数
			tableCls:"tbcheck",//表格样式
			trevenCls:"gcolor",//双数行样式
			pageCount : false,//分页是否计算
			formatData : function(data){//格式化方法，必须要重写此方法
				var o = {};
				o.rows = data["result"]||[];
				o.pageNumber = data["pageNumber"]||$.fn.hiGrid.defaults.pageNumber;
				o.pageSize = data["pageSize"]||$.fn.hiGrid.defaults.pageSize;
				o.total = data["total"]||$.fn.hiGrid.defaults.total;
				return o;
			},
			onLoadSuccess : function(data) {//成功加载回调方法
			},
			onLoadError : function(data) {//加载错误回调方法
			},
			onClickRow : function(rowIndex, rowData) {//单行点击回调方法
			},
			onSelectRow : function(rowIndex, rowData) {//单行选中回调方法
			},
			onUnselectRow : function(rowIndex, rowData) {//当行取消选中回调方法
			},
			onSelectAll : function(rows) {//全选回调方法
			},
			onUnselectAll : function(rows) {//全部选回调方法
			}
		};
		$.fn.hiGrid.methods = {
				goPage : function(jq,pageNumber) { //页面跳转
					return jq.each(function() {
						     var opts = $.data(this, 'hiGrid').options;
						     _ldg2(this,opts,pageNumber);
					});
				},
				load : function(jq) { //刷新当前页
					return jq.each(function() {
						 var opts = $.data(this, 'hiGrid').options;
					     _ldg2(this,opts,opts.pageNumber);
					});
				},
				getSelect : function(jq) { //获取当前选中项
						var selects = [];
						var opts = $(jq).data('hiGrid').options;
						var data = $(jq).data('hiGridData');
						$(jq).find('tbody tr.'+opts.selCls).each(function(i,v){
							var index = $(this).attr("data-index");
							selects.push(data[index]);
						});
						return selects;
				},
				getRowByIndex : function(jq,index) { //根据行索引取记录
						var data = $(jq).data('hiGridData');
						return data[index];
				},
				search : function(jq,param) { //按条件查询
					return jq.each(function() {
						 var opts = $.data(this, 'hiGrid').options;
						 opts.param = $.extend({}, opts.param, param);
						 showInfo(this);
					});
				},
				reload : function(jq) { //刷新到第一页
					return jq.each(function() {
						 var opts = $.data(this, 'hiGrid').options;
					     _ldg2(this,opts,1);
					});
				}
		};
})(jQuery);