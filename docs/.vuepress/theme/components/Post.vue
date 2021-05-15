<template>
  <section class="post-view">
    <div class="post-head">
      <h1 class="post-title">
        {{ $page.title }}
      </h1>
    </div>
    <div class="post-sub-head">
      <div class="post-author">{{ $page.frontmatter.author || "佚名" }}</div>
      <span class="post-gap">&nbsp;/&nbsp;</span>
      <time-ago
        :last-updated="$page.frontmatter.date || $page.lastUpdated"
        class="post-date"
      />
    </div>
    <Content />
    <div ref="comment"></div>
  </section>
</template>

<script>
import "gitalk/dist/gitalk.css";
import Gitalk from "gitalk";
import TimeAgo from "./TimeAgo";

export default {
  components: {
    TimeAgo,
  },
  mounted() {
    const gitalk = new Gitalk({
      clientID: "7a482526c12e6a8123f0",
      clientSecret: "4faf2e5ce70c1ef2328da0f6bd8306160a7b53cf",
      repo: "blog", // The repository of store comments,
      owner: "nst-fe",
      admin: ["cj0x39e"],
      id: location.pathname, // Ensure uniqueness and length less than 50
      distractionFreeMode: false, // Facebook-like distraction free mode
    });

    gitalk.render(this.$refs.comment);
  },
};
</script>
