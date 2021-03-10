<template>
  <a-col :sm="24" :md="12" :lg="6">
	  	<div class="card-tag tag-info">安全工具</div>
		<a-card hoverable>
			<img :src="cover" slot="cover" class="reset-height"/>
			<template class="ant-card-actions" slot="actions">
				<a :href="link" target="_blank" rel="noopener noreferrer">
					<a-button type="primary" icon="github" ghost>传送门</a-button>
				</a>
			</template>
			<a-card-meta :title="title" :description="author">
			</a-card-meta>
		</a-card>
	</a-col>
</template>
<script>
export default {
  name:"Card",
  props:[
    "cover",
    "link",
    "title",
    "author"
  ]
}
</script>
<style>
.card-tag {
	position: absolute;
	padding: 4px 7px 4px 14px;
	border-radius: 50px 0 0 50px;
	border: 1px solid transparent;
	border-right-color: transparent !important;
	right: 0;
	top: 15px;
	z-index: 20;
	text-align: center;
	user-select: none;
}
.tag-info {
	color: #fa8c16;
	background: #fff7e6;
	border-color: #ffd591;
}
</style>