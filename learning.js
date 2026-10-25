/* 旧学习入口或目录链接定位到规划栏目时，展开对应说明。 */
(function () {
  function revealPlanning() {
    var ids = ['club', 'articles', 'shop', 'community'];
    var id = location.hash.slice(1);
    if (ids.indexOf(id) < 0) return;
    var section = document.getElementById(id);
    if (section && section.tagName === 'DETAILS') section.open = true;
  }
  revealPlanning();
  window.addEventListener('hashchange', revealPlanning);
})();
