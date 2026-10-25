(function () {
  var search = document.getElementById('memberSearch');
  var group = document.getElementById('memberGroup');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-member-card]'));
  if (search && group && cards.length) {
    function filterMembers() {
      var query = search.value.trim().toLocaleLowerCase();
      var count = 0;
      cards.forEach(function (card) {
        var matches = (!group.value || card.dataset.group === group.value) &&
          (!query || card.dataset.search.toLocaleLowerCase().indexOf(query) >= 0);
        card.hidden = !matches;
        if (matches) count++;
      });
      document.getElementById('rosterStatus').textContent = '当前显示 ' + count + ' 位，共 ' + cards.length + ' 位联合出版人';
      document.getElementById('rosterEmpty').hidden = count !== 0;
    }
    search.addEventListener('input', filterMembers);
    group.addEventListener('change', filterMembers);
    document.getElementById('resetFilters').addEventListener('click', function () {
      search.value = '';
      group.value = '';
      filterMembers();
      search.focus();
    });
  }

  var copy = document.querySelector('[data-copy-url]');
  if (copy) {
    var status = document.getElementById('copyStatus');
    function fallback(text) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (error) {}
      field.remove();
      copy.focus();
      return copied;
    }
    copy.addEventListener('click', async function () {
      var url = copy.getAttribute('data-copy-url');
      /* 先在用户点击事件内同步复制，避免内嵌浏览器无限等待权限。 */
      var copied = fallback(url);
      if (!copied && navigator.clipboard && window.isSecureContext) {
        status.textContent = '正在复制链接…';
        var copyTimer;
        try {
          await Promise.race([
            navigator.clipboard.writeText(url),
            new Promise(function (resolve, reject) {
              copyTimer = setTimeout(function () { reject(new Error('clipboard timeout')); }, 1500);
            })
          ]);
          copied = true;
        } catch (error) {
        } finally {
          clearTimeout(copyTimer);
        }
      }
      status.textContent = copied ? '已复制正式个人主页链接，可直接分享。' : '复制未完成，请选取上方链接后手动复制。';
    });
  }
})();
