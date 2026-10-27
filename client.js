/**
 * 浏览器半边：《高性价比人生指南》阅读面板。
 *
 * 侧栏加一个图标（id 与 main 面板的 key 相同，点了就切到本页），主面板里是
 * 34 节 767 条建议的阅读、检索与筛选界面。数据走宿主只读接口
 * /howtolivebetter/api/*（正文由 tools/build-data.mjs 从仓库预生成），
 * 不联网、不引第三方库。
 */
window.__ModuleLoader__.load({
  id: 'dsh-howtolivebetter',
  factory(require) {
    const React = require('react');
    const { useCallback, useEffect, useMemo, useRef, useState } = React;
    const h = React.createElement;

    const NS = 'howtolivebetter';
    const PANEL_ID = 'howtolivebetter';
    const PANEL_ORDER = 20;
    const PANEL_LABEL_KEY = 'nav';
    const API_BASE = 'howtolivebetter/api/';
    const REPO_URL = 'https://github.com/eternity4719/HowToLiveBetter';
    const SITE_URL = 'https://eternity4719.github.io/HowToLiveBetter/';
    const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

    const DICT = {
      en: {
        nav: 'Life guide',
        brand: 'Life guide',
        title: 'HowToLiveBetter',
        subtitle: 'Trade the least money, time and willpower for the most lifespan, money and freedom.',
        stat: '{chapters} chapters · {entries} entries',
        searchPlaceholder: 'Search {entries} entries…',
        searchAria: 'Search entries',
        filters: 'Filters',
        clear: 'Clear',
        grade: 'Evidence',
        gain: 'Payoff',
        ratio: 'Value',
        scope: 'Currency',
        who: 'For',
        gradeA: 'A · numbers',
        gradeB: 'B · studies',
        gradeC: 'C · practice',
        gradeTipA: 'A: a concrete number from meta-analyses, large cohorts or RCTs',
        gradeTipB: 'B: research support without a usable number, or a single small study',
        gradeTipC: 'C: author experience or common practice, no direct study',
        gainBig: 'Big',
        gainMid: 'Medium',
        gainSmall: 'Small',
        ratioTop: 'Top',
        ratioHigh: 'High',
        ratioMid: 'Plain',
        scopeLife: 'Lifespan',
        scopeMoney: 'Money',
        scopeTime: 'Time & energy',
        scopeFree: 'Freedom',
        whoPregnant: 'Pregnancy',
        whoInfant: 'Infants',
        whoChild: 'Children',
        whoElder: 'Elderly',
        who60: '60+',
        who35: '35+',
        whoFemale: 'Women',
        intro: 'Intro',
        toc: 'Chapters',
        random: 'Random',
        randomTip: 'Jump to a random entry',
        questions: 'Questions this book answers',
        entryCount: '{n} entries',
        showing: 'Showing {shown} of {total}',
        emptyFilter: 'No entries in this chapter match the filters',
        emptySearch: 'Nothing matched. Try another word.',
        results: '{n} results',
        truncated: 'Showing the first {n}. Narrow it down with another word.',
        searchHint: 'Type to search; words separated by spaces must all appear.',
        chapterLoading: 'Loading chapter {n}…',
        loading: 'Loading…',
        loadError: 'The data did not load',
        retry: 'Retry',
        prev: 'Previous',
        next: 'Next',
        plain: 'In plain words',
        note: 'Notes',
        sources: 'Sources',
        controversial: 'Disputed',
        costLine: 'Cost',
        gainLine: 'Payoff',
        jump: 'Jump to it',
        footText: 'Text © the HowToLiveBetter authors, CC BY 4.0. Built into DeepSeek Harness as a local reading plugin.',
        repo: 'Repository',
        site: 'Online browser',
        license: 'Licence',
        committed: 'data from commit {commit}',
        chapterNo: 'Chapter {n}',
        entryNo: 'Entry {n}',
        noEntry: 'That entry no longer exists',
      },
      zh: {
        nav: '人生指南',
        brand: '人生指南',
        title: '高性价比人生指南',
        subtitle: '用最少的钱、时间和精力，换回最多的寿命、金钱和人身自由。',
        stat: '{chapters} 节 · {entries} 条',
        searchPlaceholder: '搜 {entries} 条建议…',
        searchAria: '检索建议',
        filters: '筛选',
        clear: '清空',
        grade: '证据',
        gain: '收益',
        ratio: '性价比',
        scope: '口径',
        who: '人群',
        gradeA: 'A 有数字',
        gradeB: 'B 有研究',
        gradeC: 'C 靠经验',
        gradeTipA: 'A：有具体数字，出自荟萃分析、大型队列或随机分组试验',
        gradeTipB: 'B：有研究支持，但说不出确切数字，或只有小样本单研究',
        gradeTipC: 'C：作者经验或公认做法，没有直接研究文献',
        gainBig: '大',
        gainMid: '中',
        gainSmall: '小',
        ratioTop: '极高',
        ratioHigh: '高',
        ratioMid: '一般',
        scopeLife: '换寿命',
        scopeMoney: '换钱',
        scopeTime: '换时间精力',
        scopeFree: '换人身自由',
        whoPregnant: '怀孕',
        whoInfant: '婴幼儿',
        whoChild: '孩子',
        whoElder: '老人',
        who60: '60 岁',
        who35: '35 岁',
        whoFemale: '女性',
        intro: '导语',
        toc: '章节',
        random: '随机一条',
        randomTip: '随便翻到一条',
        questions: '这本书想回答的问题',
        entryCount: '{n} 条',
        showing: '显示 {shown} / {total} 条',
        emptyFilter: '这一节没有符合筛选的条目',
        emptySearch: '没有匹配的条目，换个词试试',
        results: '找到 {n} 条',
        truncated: '只显示前 {n} 条，再补一个词能缩小范围。',
        searchHint: '边打边搜；用空格分开的词必须同时出现。',
        chapterLoading: '正在载入第 {n} 节…',
        loading: '正在载入…',
        loadError: '数据没加载出来',
        retry: '重试',
        prev: '上一节',
        next: '下一节',
        plain: '说人话',
        note: '备注',
        sources: '来源',
        controversial: '争议',
        costLine: '成本',
        gainLine: '收益',
        jump: '跳过去',
        footText: '正文版权归《高性价比人生指南》作者所有，以 CC BY 4.0 发布。本页是本地阅读插件。',
        repo: '仓库',
        site: '在线检索页',
        license: '许可协议',
        committed: '数据取自 {commit} 这次提交',
        chapterNo: '第 {n} 节',
        entryNo: '第 {n} 条',
        noEntry: '这条已经找不到了',
      },
    };

    // ------------------------------------------------------------------
    // 数据：宿主接口 + 进程内缓存。meta 一次，search 用户开始打字才取，
    // 章节点开才取；失败就清掉 promise，下次还能重试。
    // ------------------------------------------------------------------

    const store = {
      meta: null,
      metaPromise: null,
      search: null,
      searchPromise: null,
      chapters: new Map(),
    };

    function apiPath(path) {
      const relative = API_BASE + path;
      if (typeof document === 'undefined') return '/' + relative;
      return new URL(relative, document.baseURI).pathname;
    }

    function fetchJson(path) {
      return fetch(apiPath(path), { headers: { accept: 'application/json' } }).then((response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status + ' ' + path);
        return response.json();
      });
    }

    function loadMeta() {
      if (!store.metaPromise) {
        store.metaPromise = fetchJson('meta').then(
          (data) => {
            store.meta = data;
            return data;
          },
          (error) => {
            store.metaPromise = null;
            throw error;
          },
        );
      }
      return store.metaPromise;
    }

    function loadSearch() {
      if (!store.searchPromise) {
        store.searchPromise = fetchJson('search')
          .then((data) => {
            store.search = Array.isArray(data.entries) ? data.entries : [];
            return store.search;
          })
          .catch((error) => {
            store.searchPromise = null;
            throw error;
          });
      }
      return store.searchPromise;
    }

    function loadChapter(n) {
      const key = String(n);
      let promise = store.chapters.get(key);
      if (!promise) {
        promise = fetchJson('chapter/' + key).catch((error) => {
          store.chapters.delete(key);
          throw error;
        });
        store.chapters.set(key, promise);
      }
      return promise;
    }

    // ------------------------------------------------------------------
    // 筛选：证据等级 / 收益量级 / 性价比 / 口径 / 人群，组内取并集、组间取交集。
    // ------------------------------------------------------------------

    const FILTER_KEYS = ['grade', 'gain', 'ratio', 'scope', 'who'];
    const EMPTY_FILTERS = { grade: [], gain: [], ratio: [], scope: [], who: [] };
    const GRADE_VALUES = ['A', 'B', 'C'];
    const GAIN_VALUES = ['大', '中', '小'];
    const RATIO_VALUES = ['极高', '高', '一般'];
    const SCOPE_VALUES = ['死亡率', '金钱', '时间', '自由'];
    const WHO_VALUES = ['怀孕', '婴幼儿', '孩子', '老人', '60岁', '35岁', '女性'];

    function splitScope(value) {
      return String(value || '')
        .split(/[\/、，,]/)
        .map((part) => part.trim())
        .filter(Boolean);
    }

    function filterCount(filters) {
      return FILTER_KEYS.reduce((sum, key) => sum + filters[key].length, 0);
    }

    function toggleFilter(filters, key, value) {
      const list = filters[key];
      const next = list.indexOf(value) >= 0 ? list.filter((item) => item !== value) : list.concat(value);
      return Object.assign({}, filters, { [key]: next });
    }

    function rowMatches(row, filters) {
      if (filters.grade.length && filters.grade.indexOf(row.grade) < 0) return false;
      if (filters.gain.length && filters.gain.indexOf(row.gain) < 0) return false;
      if (filters.ratio.length && filters.ratio.indexOf(row.ratio) < 0) return false;
      if (filters.scope.length && !row.scope.some((scope) => filters.scope.indexOf(scope) >= 0)) return false;
      if (filters.who.length && !row.who.some((who) => filters.who.indexOf(who) >= 0)) return false;
      return true;
    }

    function chapterRow(entry) {
      return {
        grade: entry.grade,
        gain: entry.tags && entry.tags.gain,
        ratio: entry.ratio,
        scope: splitScope(entry.tags && entry.tags.scope),
        who: (entry.tags && entry.tags.who) || [],
      };
    }

    function searchRow(entry) {
      return { grade: entry.e, gain: entry.a, ratio: entry.r, scope: splitScope(entry.s), who: entry.w || [] };
    }

    // ------------------------------------------------------------------
    // 文本：数据里的正文是极简 markdown（标题/列表/表格/加粗/链接）加
    // 「见第 8 节第 17 条」这类指路，不需要完整解析器，手写一个够用的。
    // ------------------------------------------------------------------

    const XREF_RE = /(第\s*\d+\s*节\s*第\s*\d+\s*条)|(本节第\s*\d+\s*条)|(第\s*\d+\s*条)/;

    function resolveHref(href) {
      if (/^(https?:|mailto:)/i.test(href)) return href;
      if (href.indexOf('#') === 0) return href;
      const clean = href.replace(/^\.\//, '').replace(/\/+$/, '');
      if (!clean) return REPO_URL;
      return REPO_URL + '/blob/main/' + clean;
    }

    function hostOf(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (error) {
        return url.slice(0, 40);
      }
    }

    function shortUrl(url) {
      const host = hostOf(url);
      const path = (() => {
        try {
          const parsed = new URL(url);
          return parsed.pathname.length > 1 ? parsed.pathname : '';
        } catch (error) {
          return '';
        }
      })();
      const shown = host + (path.length > 26 ? path.slice(0, 26) + '…' : path);
      return shown;
    }

    function renderInline(text, ctx, keyPrefix) {
      const source = String(text || '');
      const nodes = [];
      const pattern =
        /(\*\*[^*\n]+\*\*)|(`[^`\n]+`)|(\[[^\]\n]+\]\([^)\s]+\))|(<(?:https?|mailto):[^>\s]+>)|(第\s*\d+\s*节\s*第\s*\d+\s*条)|(本节第\s*\d+\s*条)|(第\s*\d+\s*条)/g;
      let last = 0;
      let match;
      let index = 0;
      const push = (node) => {
        if (node === null || node === undefined || node === '') return;
        nodes.push(node);
      };
      while ((match = pattern.exec(source)) !== null) {
        if (match.index > last) push(source.slice(last, match.index));
        const token = match[0];
        const key = keyPrefix + ':' + index++;
        if (match[1]) {
          push(h('strong', { key }, token.slice(2, -2)));
        } else if (match[2]) {
          push(h('code', { key }, token.slice(1, -1)));
        } else if (match[3]) {
          const parsed = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
          if (parsed) {
            push(
              h(
                'a',
                { key, href: resolveHref(parsed[2]), target: '_blank', rel: 'noreferrer noopener' },
                renderInline(parsed[1], ctx, key + 'a'),
              ),
            );
          } else {
            push(token);
          }
        } else if (match[4]) {
          const url = token.slice(1, -1);
          push(
            h('a', { key, href: url, target: '_blank', rel: 'noreferrer noopener', title: url }, shortUrl(url)),
          );
        } else {
          const pair = /(\d+)[^\d]+(\d+)/.exec(token);
          let chapter = ctx.chapter;
          let entryNumber = NaN;
          if (match[5] && pair) {
            chapter = Number(pair[1]);
            entryNumber = Number(pair[2]);
          } else if (match[6] && pair) {
            entryNumber = Number(pair[1]);
          } else if (match[7] && pair) {
            entryNumber = Number(pair[1]);
          }
          if (Number.isInteger(chapter) && Number.isInteger(entryNumber)) {
            push(
              h(
                'button',
                {
                  key,
                  type: 'button',
                  className: 'htlb-xref',
                  title: ctx.t ? ctx.t('jump') : '',
                  onClick: () => ctx.onJump && ctx.onJump(chapter, entryNumber),
                },
                token,
              ),
            );
          } else {
            push(token);
          }
        }
        last = match.index + token.length;
      }
      if (last < source.length) push(source.slice(last));
      return nodes;
    }

    function isBlockStart(line) {
      return (
        /^#{1,4}\s+/.test(line) ||
        /^>\s?/.test(line) ||
        /^\s*[-*]\s+/.test(line) ||
        /^\s*\d+\.\s+/.test(line) ||
        /^\s*\|/.test(line) ||
        /^\s*---+\s*$/.test(line)
      );
    }

    function renderTable(lines, ctx, keyPrefix) {
      const rows = lines
        .map((line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim()))
        .filter((cells) => cells.length > 0 && cells.some((cell) => cell !== ''));
      if (rows.length === 0) return null;
      const hasHeader = rows.length > 1 && rows[1].every((cell) => /^:?-{2,}:?$/.test(cell));
      const head = hasHeader ? rows[0] : null;
      const body = hasHeader ? rows.slice(2) : rows;
      return h(
        'table',
        { key: keyPrefix },
        head
          ? h(
              'thead',
              null,
              h(
                'tr',
                null,
                head.map((cell, cellIndex) => h('th', { key: cellIndex }, renderInline(cell, ctx, keyPrefix + ':h' + cellIndex))),
              ),
            )
          : null,
        h(
          'tbody',
          null,
          body.map((cells, rowIndex) =>
            h(
              'tr',
              { key: rowIndex },
              cells.map((cell, cellIndex) =>
                h('td', { key: cellIndex }, renderInline(cell, ctx, keyPrefix + ':r' + rowIndex + 'c' + cellIndex)),
              ),
            ),
          ),
        ),
      );
    }

    function renderMarkdown(markdown, ctx = {}) {
      const text = String(markdown || '');
      if (!text.trim()) return null;
      const lines = text.split('\n');
      const blocks = [];
      let index = 0;
      let key = 0;
      while (index < lines.length) {
        const line = lines[index];
        if (!line.trim()) {
          index += 1;
          continue;
        }
        const heading = /^(#{1,4})\s+(.+?)\s*$/.exec(line);
        if (heading) {
          const level = Math.min(heading[1].length + 1, 6);
          blocks.push(h('h' + level, { key: key++ }, renderInline(heading[2], ctx, 'h' + key)));
          index += 1;
          continue;
        }
        if (/^\s*---+\s*$/.test(line)) {
          blocks.push(h('hr', { key: key++ }));
          index += 1;
          continue;
        }
        if (/^>\s?/.test(line)) {
          const quoted = [];
          while (index < lines.length && /^>\s?/.test(lines[index])) {
            quoted.push(lines[index].replace(/^>\s?/, ''));
            index += 1;
          }
          blocks.push(
            h('blockquote', { key: key++ }, renderInline(quoted.join('\n'), ctx, 'q' + key)),
          );
          continue;
        }
        if (/^\s*\|/.test(line)) {
          const tableLines = [];
          while (index < lines.length && /^\s*\|/.test(lines[index])) {
            tableLines.push(lines[index]);
            index += 1;
          }
          const table = renderTable(tableLines, ctx, 't' + key);
          if (table) blocks.push(table);
          key += 1;
          continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
          const items = [];
          while (index < lines.length) {
            const current = lines[index];
            const itemMatch = /^\s*[-*]\s+(.*)$/.exec(current);
            if (itemMatch) {
              items.push(itemMatch[1]);
              index += 1;
              continue;
            }
            if (!current.trim()) break;
            if (items.length > 0 && (/^\s{2,}\S/.test(current) || !isBlockStart(current))) {
              items[items.length - 1] += (items[items.length - 1] ? '\n' : '') + current.trim();
              index += 1;
              continue;
            }
            break;
          }
          blocks.push(
            h(
              'ul',
              { key: key++ },
              items.map((item, itemIndex) =>
                h('li', { key: itemIndex }, renderInline(item, ctx, 'li' + key + ':' + itemIndex)),
              ),
            ),
          );
          continue;
        }
        if (/^\s*\d+\.\s+/.test(line)) {
          const items = [];
          while (index < lines.length) {
            const current = lines[index];
            const itemMatch = /^\s*\d+\.\s+(.*)$/.exec(current);
            if (itemMatch) {
              items.push(itemMatch[1]);
              index += 1;
              continue;
            }
            if (!current.trim()) break;
            if (items.length > 0 && (/^\s{2,}\S/.test(current) || !isBlockStart(current))) {
              items[items.length - 1] += '\n' + current.trim();
              index += 1;
              continue;
            }
            break;
          }
          blocks.push(
            h(
              'ol',
              { key: key++ },
              items.map((item, itemIndex) =>
                h('li', { key: itemIndex }, renderInline(item, ctx, 'ol' + key + ':' + itemIndex)),
              ),
            ),
          );
          continue;
        }
        const paragraph = [];
        while (index < lines.length && lines[index].trim() && !(paragraph.length > 0 && isBlockStart(lines[index]))) {
          paragraph.push(lines[index]);
          index += 1;
        }
        if (paragraph.length === 0) {
          index += 1;
          continue;
        }
        blocks.push(h('p', { key: key++ }, renderInline(paragraph.join('\n'), ctx, 'p' + key)));
      }
      return blocks;
    }

    function highlight(text, tokens, keyPrefix) {
      const source = String(text || '');
      if (!tokens || tokens.length === 0) return source;
      const escaped = tokens
        .slice()
        .sort((left, right) => right.length - left.length)
        .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const parts = source.split(new RegExp('(' + escaped.join('|') + ')', 'gi'));
      return parts.map((part, index) =>
        tokens.some((token) => token.toLowerCase() === part.toLowerCase())
          ? h('mark', { key: keyPrefix + ':' + index, className: 'htlb-mark' }, part)
          : part,
      );
    }

    // ------------------------------------------------------------------
    // Hooks
    // ------------------------------------------------------------------

    function useDebounced(value, delay) {
      const [debounced, setDebounced] = useState(value);
      useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
      }, [value, delay]);
      return debounced;
    }

    function useMeta() {
      const [state, setState] = useState(() =>
        store.meta ? { status: 'ready', meta: store.meta } : { status: 'loading' },
      );
      const retry = useCallback(() => {
        store.metaPromise = null;
        store.meta = null;
        setState({ status: 'loading' });
      }, []);
      useEffect(() => {
        if (state.status !== 'loading') return undefined;
        let alive = true;
        loadMeta().then(
          (meta) => {
            if (alive) setState({ status: 'ready', meta });
          },
          (error) => {
            if (alive) setState({ status: 'error', error });
          },
        );
        return () => {
          alive = false;
        };
      }, [state.status]);
      return Object.assign({}, state, { retry });
    }

    function useChapter(chapter, attempt) {
      const [state, setState] = useState(() => ({ status: 'loading', chapter }));
      useEffect(() => {
        if (!chapter) return undefined;
        let alive = true;
        setState({ status: 'loading', chapter });
        loadChapter(chapter).then(
          (data) => {
            if (alive) setState({ status: 'ready', chapter, data });
          },
          (error) => {
            if (alive) setState({ status: 'error', chapter, error });
          },
        );
        return () => {
          alive = false;
        };
      }, [chapter, attempt]);
      return state;
    }

    function useSearch(active) {
      const [state, setState] = useState(() =>
        store.search ? { status: 'ready', entries: store.search } : { status: 'idle', entries: [] },
      );
      useEffect(() => {
        if (!active) return undefined;
        if (store.search) {
          setState({ status: 'ready', entries: store.search });
          return undefined;
        }
        let alive = true;
        setState({ status: 'loading', entries: [] });
        loadSearch().then(
          (entries) => {
            if (alive) setState({ status: 'ready', entries });
          },
          () => {
            if (alive) setState({ status: 'error', entries: [] });
          },
        );
        return () => {
          alive = false;
        };
      }, [active]);
      return state;
    }

    // ------------------------------------------------------------------
    // 小组件
    // ------------------------------------------------------------------

    function BookIcon({ size }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'M4 5.5c2.4-1.2 4.9-1.2 7 .6v12.4c-2.1-1.8-4.6-1.8-7-.6z' }),
        h('path', { d: 'M20 5.5c-2.4-1.2-4.9-1.2-7 .6v12.4c2.1-1.8 4.6-1.8 7-.6z' }),
        h('path', { d: 'M9.2 10.2h1.9M13 10.2h1.9' }),
        h('circle', { cx: 17.4, cy: 17.6, r: 3.9, fill: 'currentColor', stroke: 'none', opacity: 0.22 }),
        h('path', { d: 'M15.4 17.7l1.4 1.4 2.5-2.7' }),
      );
    }

    function SearchIcon() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': 'true' },
        h('circle', { cx: 7, cy: 7, r: 4.4 }),
        h('path', { d: 'M10.4 10.4L14 14' }),
      );
    }

    function Tag({ kind, title, children }) {
      return h('span', { className: 'htlb-tag', 'data-kind': kind || 'plain', title: title || undefined }, children);
    }

    function Chip({ on, onClick, title, children }) {
      return h(
        'button',
        { type: 'button', className: 'htlb-chip', 'data-on': on ? '1' : '0', onClick, title: title || undefined, 'aria-pressed': on ? 'true' : 'false' },
        children,
      );
    }

    function GradeTag({ t, grade }) {
      const kind = grade === 'A' ? 'A' : grade === 'B' ? 'B' : 'C';
      return h(Tag, { kind, title: t('gradeTip' + kind) }, t('grade' + kind));
    }

    function RatioTag({ t, ratio }) {
      const label = ratio === '极高' ? t('ratioTop') : ratio === '高' ? t('ratioHigh') : t('ratioMid');
      return h(Tag, { kind: ratio === '极高' ? 'top' : 'plain' }, label);
    }

    function GainTag({ t, gain }) {
      const label = gain === '大' ? t('gainBig') : gain === '中' ? t('gainMid') : t('gainSmall');
      return h(Tag, { kind: 'plain' }, t('gain') + ' ' + label);
    }

    function ScopeTag({ t, scope }) {
      const map = { 死亡率: 'scopeLife', 金钱: 'scopeMoney', 时间: 'scopeTime', 自由: 'scopeFree' };
      return h(Tag, { kind: 'plain' }, splitScope(scope).map((item) => t(map[item] || 'scopeTime')).join(' / '));
    }

    function WhoTag({ t, who }) {
      if (!who || who.length === 0) return null;
      const map = {
        怀孕: 'whoPregnant',
        婴幼儿: 'whoInfant',
        孩子: 'whoChild',
        老人: 'whoElder',
        '60岁': 'who60',
        '35岁': 'who35',
        女性: 'whoFemale',
      };
      return h(Tag, { kind: 'plain' }, who.map((item) => t(map[item] || 'whoChild')).join(' / '));
    }

    function SourceList({ sources }) {
      return h(
        'ul',
        { className: 'htlb-srcs' },
        sources.map((source, index) => {
          const label = String(source.label || '').replace(/\s+/g, ' ').trim();
          const clipped = label.split(/「|『|"/)[0].trim() || label;
          const shown = clipped.length > 130 ? clipped.slice(0, 130) + '…' : clipped;
          const urls = source.urls || [];
          if (urls.length === 0) {
            return h('li', { key: index }, h('span', { title: label || undefined }, shown));
          }
          return h(
            'li',
            { key: index },
            h(
              'a',
              { href: urls[0], target: '_blank', rel: 'noreferrer noopener', title: urls[0] },
              shown || shortUrl(urls[0]),
            ),
            urls.slice(1).map((url, urlIndex) =>
              h(
                'a',
                { key: urlIndex, className: 'htlb-srcdot', href: url, target: '_blank', rel: 'noreferrer noopener', title: url },
                hostOf(url),
              ),
            ),
          );
        }),
      );
    }

    function EntryCard({ t, chapter, entry, index }) {
      const mdCtx = { chapter, onJump: entry.onJump, t };
      return h(
        'article',
        { className: 'htlb-card', 'data-entry': entry.n, 'data-index': index },
        h(
          'div',
          { className: 'htlb-card-head' },
          h('span', { className: 'htlb-card-no' }, chapter + '.' + entry.n),
          h('h3', { className: 'htlb-card-title' }, entry.title),
        ),
        h(
          'div',
          { className: 'htlb-chips' },
          h(GradeTag, { t, grade: entry.grade }),
          h(GainTag, { t, gain: entry.tags.gain }),
          h(RatioTag, { t, ratio: entry.ratio }),
          h(ScopeTag, { t, scope: entry.tags.scope }),
          h(WhoTag, { t, who: entry.tags.who }),
          entry.controversial ? h(Tag, { kind: 'flag' }, t('controversial')) : null,
        ),
        h('p', { className: 'htlb-plain' }, entry.plain),
        h(
          'div',
          { className: 'htlb-fact' },
          h('b', null, t('costLine')),
          h(
            'div',
            { className: 'htlb-prose htlb-factbody' },
            renderMarkdown(entry.costText, Object.assign({}, mdCtx, { chapter })),
          ),
        ),
        h(
          'div',
          { className: 'htlb-fact' },
          h('b', null, t('gainLine')),
          h(
            'div',
            { className: 'htlb-prose htlb-factbody' },
            renderMarkdown(entry.gainText, Object.assign({}, mdCtx, { chapter })),
          ),
        ),
        entry.note
          ? h(
              'details',
              { className: 'htlb-fold', key: 'note' },
              h('summary', null, t('note')),
              h(
                'div',
                { className: 'htlb-fold-body htlb-prose' },
                renderMarkdown(entry.note, Object.assign({}, mdCtx, { chapter })),
              ),
            )
          : null,
        entry.sources && entry.sources.length
          ? h(
              'details',
              { className: 'htlb-fold', key: 'src' },
              h('summary', null, t('sources') + ' · ' + entry.sources.length),
              h('div', { className: 'htlb-fold-body' }, h(SourceList, { sources: entry.sources })),
            )
          : null,
      );
    }

    function FilterBar({ t, filters, onChange }) {
      const group = (labelKey, key, values) =>
        h(
          'div',
          { className: 'htlb-fgroup', key },
          h('span', { className: 'htlb-flabel' }, t(labelKey)),
          values.map((value) =>
            h(
              Chip,
              {
                key: key + ':' + value.value,
                on: filters[key].indexOf(value.value) >= 0,
                onClick: () => onChange(toggleFilter(filters, key, value.value)),
                title: value.title,
              },
              value.label,
            ),
          ),
        );
      const active = filterCount(filters) > 0;
      return h(
        'div',
        { className: 'htlb-filters' },
        group('grade', 'grade', [
          { value: 'A', label: t('gradeA'), title: t('gradeTipA') },
          { value: 'B', label: t('gradeB'), title: t('gradeTipB') },
          { value: 'C', label: t('gradeC'), title: t('gradeTipC') },
        ]),
        group('gain', 'gain', [
          { value: '大', label: t('gainBig') },
          { value: '中', label: t('gainMid') },
          { value: '小', label: t('gainSmall') },
        ]),
        group('ratio', 'ratio', [
          { value: '极高', label: t('ratioTop') },
          { value: '高', label: t('ratioHigh') },
          { value: '一般', label: t('ratioMid') },
        ]),
        group('scope', 'scope', [
          { value: '死亡率', label: t('scopeLife') },
          { value: '金钱', label: t('scopeMoney') },
          { value: '时间', label: t('scopeTime') },
          { value: '自由', label: t('scopeFree') },
        ]),
        group('who', 'who', [
          { value: '怀孕', label: t('whoPregnant') },
          { value: '婴幼儿', label: t('whoInfant') },
          { value: '孩子', label: t('whoChild') },
          { value: '老人', label: t('whoElder') },
          { value: '60岁', label: t('who60') },
          { value: '35岁', label: t('who35') },
          { value: '女性', label: t('whoFemale') },
        ]),
        active
          ? h(
              'button',
              { type: 'button', className: 'htlb-btn htlb-btn-ghost', onClick: () => onChange(EMPTY_FILTERS) },
              t('clear'),
            )
          : null,
      );
    }

    function NavList({ t, meta, route, onIntro, onChapter }) {
      return h(
        'nav',
        { className: 'htlb-nav' },
        h('div', { className: 'htlb-navhead' }, h('span', null, t('toc'))),
        h(
          'button',
          {
            type: 'button',
            className: 'htlb-navitem',
            'data-on': route.kind === 'intro' ? '1' : '0',
            onClick: onIntro,
          },
          h('span', { className: 'htlb-navnum' }, '§'),
          h('span', { className: 'htlb-navtext' }, t('intro')),
        ),
        meta.chapters.map((chapter) =>
          h(
            'button',
            {
              key: chapter.n,
              type: 'button',
              className: 'htlb-navitem',
              'data-on': route.kind === 'chapter' && route.ch === chapter.n ? '1' : '0',
              onClick: () => onChapter(chapter.n),
              title: chapter.title,
            },
            h('span', { className: 'htlb-navnum' }, chapter.n),
            h('span', { className: 'htlb-navtext' }, chapter.title),
            h('span', { className: 'htlb-navcount' }, chapter.entries),
          ),
        ),
      );
    }

    // ------------------------------------------------------------------
    // 视图
    // ------------------------------------------------------------------

    function IntroView({ t, meta, onChapter, onRandom, onJump }) {
      const stats = meta.stats || {};
      const grades = stats.grades || {};
      const mdCtx = { onJump: onJump || onChapter, t };
      return h(
        'div',
        { className: 'htlb-wrap' },
        h(
          'header',
          { className: 'htlb-intro-head' },
          h('h1', { className: 'htlb-h1' }, meta.title || t('title')),
          h('p', { className: 'htlb-sub' }, meta.subtitle || t('subtitle')),
          h(
            'div',
            { className: 'htlb-chips' },
            h(Tag, { kind: 'plain' }, t('stat', { chapters: stats.chapters || meta.chapters.length, entries: stats.entries || 0 })),
            h(Tag, { kind: 'A' }, 'A ' + (grades.A || 0)),
            h(Tag, { kind: 'B' }, 'B ' + (grades.B || 0)),
            h(Tag, { kind: 'C' }, 'C ' + (grades.C || 0)),
            h(Tag, { kind: 'flag' }, t('controversial') + ' ' + (stats.controversial || 0)),
          ),
          h(
            'div',
            { className: 'htlb-actions' },
            h(
              'button',
              { type: 'button', className: 'htlb-btn', 'data-primary': '1', onClick: () => onChapter(1) },
              t('chapterNo', { n: 1 }) + ' · ' + (meta.chapters[0] ? meta.chapters[0].title : ''),
            ),
            h('button', { type: 'button', className: 'htlb-btn', onClick: onRandom }, t('random')),
          ),
        ),
        h('div', { className: 'htlb-prose' }, renderMarkdown(meta.intro, mdCtx)),
        meta.questions && meta.questions.length
          ? h(
              'section',
              { className: 'htlb-questions' },
              h('h2', { className: 'htlb-sh2' }, t('questions')),
              h(
                'div',
                { className: 'htlb-qgrid' },
                meta.questions.map((question) =>
                  h(
                    'button',
                    {
                      key: question.n,
                      type: 'button',
                      className: 'htlb-q',
                      onClick: () => onChapter(question.n),
                      title: t('chapterNo', { n: question.n }),
                    },
                    h('span', { className: 'htlb-qn' }, question.n),
                    h('span', null, question.q),
                  ),
                ),
              ),
            )
          : null,
        (meta.sections || []).map((section) =>
          h(
            'details',
            { className: 'htlb-sec', key: section.id },
            h('summary', null, section.title),
            h('div', { className: 'htlb-sec-body htlb-prose' }, renderMarkdown(section.md, mdCtx)),
          ),
        ),
        h(
          'footer',
          { className: 'htlb-foot' },
          h('div', null, t('footText')),
          h(
            'div',
            null,
            h('a', { href: REPO_URL, target: '_blank', rel: 'noreferrer noopener' }, t('repo')),
            ' · ',
            h('a', { href: SITE_URL, target: '_blank', rel: 'noreferrer noopener' }, t('site')),
            ' · ',
            h('a', { href: LICENSE_URL, target: '_blank', rel: 'noreferrer noopener' }, t('license') + ' CC BY 4.0'),
            meta.source && meta.source.commit ? ' · ' + t('committed', { commit: String(meta.source.commit).slice(0, 7) }) : '',
          ),
        ),
      );
    }

    function ChapterView({ t, meta, route, filters, onNavigate, onClearFilters, scrollRef }) {
      const [attempt, setAttempt] = useState(0);
      const state = useChapter(route.ch, attempt);
      const chapterInfo = meta.chapters.find((item) => item.n === route.ch) || {};
      const focus = route.focus;

      useEffect(() => {
        if (state.status !== 'ready' || !focus || focus.ch !== route.ch) return;
        const container = scrollRef.current;
        if (!container) return;
        const card = container.querySelector('[data-entry="' + focus.n + '"]');
        if (!card) return;
        card.scrollIntoView({ block: 'center', behavior: 'smooth' });
        card.classList.remove('htlb-flash');
        void card.offsetWidth;
        card.classList.add('htlb-flash');
      }, [state.status, focus, route.ch, scrollRef]);

      if (state.status === 'loading') {
        return h('div', { className: 'htlb-wrap' }, h(Loading, { t, label: t('chapterLoading', { n: route.ch }) }));
      }
      if (state.status === 'error') {
        return h('div', { className: 'htlb-wrap' }, h(ErrorBox, { t, onRetry: () => setAttempt((value) => value + 1) }));
      }

      const chapter = state.data;
      const mdCtx = { chapter: route.ch, onJump: (ch, n) => onNavigate({ kind: 'chapter', ch, focus: { ch, n, nonce: Date.now() } }), t };
      const entries = chapter.entries.filter((entry) => rowMatches(chapterRow(entry), filters));
      const prev = route.ch > 1 ? route.ch - 1 : null;
      const next = route.ch < meta.chapters.length ? route.ch + 1 : null;

      return h(
        'div',
        { className: 'htlb-wrap' },
        h(
          'header',
          { className: 'htlb-chead' },
          h('div', { className: 'htlb-cnum' }, t('chapterNo', { n: route.ch })),
          h('h2', { className: 'htlb-ctitle' }, chapter.title),
          h(
            'div',
            { className: 'htlb-crow' },
            h(Tag, { kind: 'plain' }, t('entryCount', { n: chapter.entries.length })),
            h(
              'div',
              { className: 'htlb-pager' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'htlb-btn htlb-btn-ghost',
                  disabled: prev === null,
                  onClick: () => prev && onNavigate({ kind: 'chapter', ch: prev, focus: null }),
                },
                '← ' + t('prev'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'htlb-btn htlb-btn-ghost',
                  disabled: next === null,
                  onClick: () => next && onNavigate({ kind: 'chapter', ch: next, focus: null }),
                },
                t('next') + ' →',
              ),
            ),
          ),
          chapterInfo.desc
            ? h(
                'details',
                { className: 'htlb-fold' },
                h('summary', null, t('chapterNo', { n: route.ch }) + ' · ' + t('plain')),
                h('div', { className: 'htlb-fold-body htlb-prose' }, renderMarkdown(chapterInfo.desc, mdCtx)),
              )
            : null,
        ),
        chapter.intro ? h('div', { className: 'htlb-prose htlb-chintro' }, renderMarkdown(chapter.intro, mdCtx)) : null,
        filterCount(filters) > 0
          ? h(
              'div',
              { className: 'htlb-hint' },
              t('showing', { shown: entries.length, total: chapter.entries.length }),
              ' ',
              h('button', { type: 'button', className: 'htlb-linkbtn', onClick: onClearFilters }, t('clear')),
            )
          : null,
        entries.map((entry, index) =>
          h(EntryCard, { key: entry.n, t, chapter: route.ch, entry: Object.assign({}, entry, { onJump: mdCtx.onJump }), index }),
        ),
        entries.length === 0
          ? h('div', { className: 'htlb-empty' }, t('emptyFilter'), ' ', h('button', { type: 'button', className: 'htlb-linkbtn', onClick: onClearFilters }, t('clear')))
          : null,
        chapter.license ? h('div', { className: 'htlb-prose htlb-chintro', style: { marginTop: '18px' } }, renderMarkdown(chapter.license, mdCtx)) : null,
      );
    }

    function SearchView({ t, meta, query, tokens, state, filters, onJump }) {
      const chapterTitle = useMemo(() => {
        const map = new Map();
        (meta.chapters || []).forEach((chapter) => map.set(chapter.n, chapter.title));
        return map;
      }, [meta]);

      if (state.status === 'loading' || state.status === 'idle') {
        return h('div', { className: 'htlb-wrap' }, h(Loading, { t, label: t('loading') }));
      }
      if (state.status === 'error') {
        return h('div', { className: 'htlb-wrap' }, h('div', { className: 'htlb-empty' }, t('loadError')));
      }

      const matched = state.entries.filter((entry) => {
        if (!rowMatches(searchRow(entry), filters)) return false;
        const haystack = [entry.t, entry.p, entry.g, entry.k, entry.ct].join('\n').toLowerCase();
        return tokens.every((token) => haystack.indexOf(token.toLowerCase()) >= 0);
      });
      const limited = matched.slice(0, 300);

      return h(
        'div',
        { className: 'htlb-wrap' },
        h('div', { className: 'htlb-hint' }, t('results', { n: matched.length })),
        matched.length > limited.length ? h('div', { className: 'htlb-hint' }, t('truncated', { n: limited.length })) : null,
        limited.map((entry) =>
          h(
            'button',
            {
              key: entry.c + '-' + entry.n,
              type: 'button',
              className: 'htlb-hit',
              onClick: () => onJump(entry.c, entry.n),
            },
            h(
              'div',
              { className: 'htlb-chips' },
              h(GradeTag, { t, grade: entry.e }),
              entry.a ? h(Tag, { kind: 'plain' }, t('gain') + ' ' + (entry.a === '大' ? t('gainBig') : entry.a === '中' ? t('gainMid') : t('gainSmall'))) : null,
              entry.r ? h(RatioTag, { t, ratio: entry.r }) : null,
              entry.cv ? h(Tag, { kind: 'flag' }, t('controversial')) : null,
              h(Tag, { kind: 'plain' }, chapterTitle.get(entry.c) || t('chapterNo', { n: entry.c })),
            ),
            h('div', { className: 'htlb-hittitle' }, highlight(entry.t, tokens, 't')),
            h('p', { className: 'htlb-hitplain' }, highlight(entry.p, tokens, 'p')),
          ),
        ),
        matched.length === 0 ? h('div', { className: 'htlb-empty' }, t('emptySearch')) : null,
      );
    }

    function Loading({ t, label }) {
      return h(
        'div',
        { className: 'htlb-loadingrow' },
        h('span', { className: 'htlb-dot' }),
        h('span', null, label || t('loading')),
      );
    }

    function ErrorBox({ t, onRetry }) {
      return h(
        'div',
        { className: 'htlb-empty' },
        h('div', null, t('loadError')),
        h('button', { type: 'button', className: 'htlb-btn', style: { marginTop: '10px' }, onClick: onRetry }, t('retry')),
      );
    }

    // ------------------------------------------------------------------
    // 面板
    // ------------------------------------------------------------------

    function PanelApp({ t }) {
      const metaState = useMeta();
      const [routeState, setRouteState] = useState({ kind: 'intro', ch: null, focus: null });
      const [filters, setFilters] = useState(EMPTY_FILTERS);
      const [query, setQuery] = useState('');
      const [randomNonce, setRandomNonce] = useState(0);
      const debouncedQuery = useDebounced(query, 160);
      const scrollRef = useRef(null);
      const meta = metaState.status === 'ready' ? metaState.meta : null;
      const trimmed = debouncedQuery.trim();
      const tokens = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
      const searching = tokens.length > 0;
      const searchState = useSearch(searching);

      const navigate = useCallback((next) => {
        setRouteState(next);
        const container = scrollRef.current;
        if (container) container.scrollTop = 0;
      }, []);

      const goChapter = useCallback(
        (chapter, entry) => {
          setRouteState({
            kind: 'chapter',
            ch: chapter,
            focus: entry ? { ch: chapter, n: entry, nonce: Date.now() } : null,
          });
          setQuery('');
          const container = scrollRef.current;
          if (container) container.scrollTop = 0;
        },
        [],
      );

      const goRandom = useCallback(() => {
        if (!meta) return;
        const chapters = meta.chapters || [];
        if (chapters.length === 0) return;
        const chapter = chapters[Math.floor(Math.random() * chapters.length)];
        const entryNumber = 1 + Math.floor(Math.random() * Math.max(1, chapter.entries || 1));
        setRandomNonce((value) => value + 1);
        goChapter(chapter.n, entryNumber);
      }, [meta, goChapter]);

      const retryMeta = metaState.retry;

      const route = searching ? { kind: 'search', ch: null, focus: null } : routeState;

      useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        if (!route.focus) container.scrollTop = 0;
      }, [route.kind, route.ch, route.focus]);

      const body = (() => {
        if (!meta) {
          if (metaState.status === 'error') return h(ErrorBox, { t, onRetry: retryMeta });
          return h(Loading, { t, label: t('loading') });
        }
        if (searching) {
          return h(SearchView, { t, meta, query: trimmed, tokens, state: searchState, filters, onJump: goChapter });
        }
        if (route.kind === 'chapter' && route.ch) {
          return h(ChapterView, {
            t,
            meta,
            route,
            filters,
            scrollRef,
            onNavigate: navigate,
            onClearFilters: () => setFilters(EMPTY_FILTERS),
          });
        }
        return h(IntroView, {
          t,
          meta,
          onChapter: (chapter) => goChapter(chapter),
          onRandom: goRandom,
          onJump: goChapter,
        });
      })();

      const stats = meta && meta.stats ? meta.stats : null;

      return h(
        'div',
        { className: 'htlb-root' },
        h(
          'header',
          { className: 'htlb-head' },
          h(
            'div',
            { className: 'htlb-row' },
            h('span', { className: 'htlb-brand-dot' }),
            h('span', { className: 'htlb-brand' }, t('brand')),
            stats
              ? h('span', { className: 'htlb-stat' }, t('stat', { chapters: stats.chapters, entries: stats.entries }))
              : null,
            h('span', { className: 'htlb-spacer' }),
            h(
              'div',
              { className: 'htlb-search' },
              h(SearchIcon),
              h('input', {
                className: 'htlb-input',
                value: query,
                placeholder: t('searchPlaceholder', { entries: stats ? stats.entries : 767 }),
                'aria-label': t('searchAria'),
                spellCheck: false,
                onChange: (event) => setQuery(event.target.value),
              }),
              query
                ? h(
                    'button',
                    { type: 'button', className: 'htlb-clear', title: t('clear'), onClick: () => setQuery('') },
                    '×',
                  )
                : null,
            ),
          ),
          h(FilterBar, { t, filters, onChange: setFilters }),
        ),
        h(
          'div',
          { className: 'htlb-body' },
          meta ? h(NavList, { t, meta, route, onIntro: () => navigate({ kind: 'intro', ch: null, focus: null }), onChapter: (chapter) => goChapter(chapter) }) : null,
          h('section', { className: 'htlb-main', ref: scrollRef }, body),
        ),
      );
    }

    // ------------------------------------------------------------------
    // 样式（全部用界面主题变量，跟随深浅色和字号偏好）
    // ------------------------------------------------------------------

    const CSS = `
.htlb-root{
  --htlb-text:var(--dsw-alias-label-primary,#1f2328);
  --htlb-text-2:var(--dsw-alias-label-secondary,#5b6067);
  --htlb-text-3:var(--dsw-alias-label-tertiary,#8a9097);
  --htlb-bg:var(--dsw-alias-bg-base,#fff);
  --htlb-card:var(--dsw-alias-bg-layer-1,#f7f8f9);
  --htlb-line:var(--dsw-alias-border-l2,rgba(0,0,0,.09));
  --htlb-line-2:var(--dsw-alias-border-l3,rgba(0,0,0,.16));
  --htlb-brand:var(--dsw-alias-brand-primary,#0a6b4f);
  --htlb-link:var(--dsw-alias-link,#0a6b4f);
  --htlb-hover:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.045));
  --htlb-ok:var(--dsw-alias-state-success-primary,#16803f);
  --htlb-warn:var(--dsw-alias-state-warn-primary,#96610a);
  box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column;
  background:var(--htlb-bg);color:var(--htlb-text);font-size:13px;line-height:1.72;
  container-type:inline-size;container-name:htlb;overflow:hidden;
  padding:calc(14px + var(--dsh-frame-top-clearance,0px)) 0 0;
}
.htlb-root *{box-sizing:border-box}
.htlb-head{flex:none;display:flex;flex-direction:column;gap:9px;padding:0 18px 10px;border-bottom:1px solid var(--htlb-line)}
.htlb-row{display:flex;align-items:center;gap:10px;min-width:0}
.htlb-brand{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:650;white-space:nowrap;letter-spacing:.01em}
.htlb-brand-dot{width:8px;height:8px;border-radius:50%;background:var(--htlb-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--htlb-brand) 16%,transparent);flex:none}
.htlb-stat{font-size:11px;color:var(--htlb-text-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.htlb-spacer{flex:1 1 auto;min-width:6px}
.htlb-search{position:relative;display:flex;align-items:center;flex:0 1 300px;min-width:120px}
.htlb-search svg{position:absolute;left:9px;width:13px;height:13px;color:var(--htlb-text-3);pointer-events:none}
.htlb-input{width:100%;height:28px;border-radius:999px;border:1px solid var(--htlb-line-2);background:var(--htlb-card);color:var(--htlb-text);padding:0 30px 0 27px;font:inherit;font-size:12px;outline:none}
.htlb-input:focus{border-color:var(--htlb-brand);background:var(--htlb-bg)}
.htlb-input::placeholder{color:var(--htlb-text-3)}
.htlb-clear{position:absolute;right:5px;width:20px;height:20px;border:0;border-radius:50%;background:transparent;color:var(--htlb-text-3);cursor:pointer;padding:0;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center}
.htlb-clear:hover{background:var(--htlb-hover);color:var(--htlb-text)}
.htlb-count{font-size:11px;color:var(--htlb-text-3);white-space:nowrap;font-variant-numeric:tabular-nums}
.htlb-filters{display:flex;align-items:center;flex-wrap:wrap;gap:5px 12px}
.htlb-fgroup{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.htlb-flabel{font-size:10.5px;color:var(--htlb-text-3);letter-spacing:.04em;white-space:nowrap}
.htlb-chip{height:22px;padding:0 8px;border-radius:999px;border:1px solid var(--htlb-line-2);background:transparent;color:var(--htlb-text-2);font:inherit;font-size:11px;line-height:20px;cursor:pointer;white-space:nowrap;transition:background .12s,color .12s,border-color .12s}
.htlb-chip:hover{background:var(--htlb-hover);color:var(--htlb-text)}
.htlb-chip[data-on="1"]{background:var(--htlb-brand);border-color:var(--htlb-brand);color:var(--dsw-alias-label-primary-foreground,#fff)}
.htlb-body{flex:1;min-height:0;display:flex}
.htlb-nav{flex:none;width:230px;overflow:auto;padding:10px 8px 60px;border-right:1px solid var(--htlb-line);overscroll-behavior:contain}
.htlb-navhead{font-size:10.5px;letter-spacing:.08em;color:var(--htlb-text-3);padding:4px 8px 6px}
.htlb-navitem{display:flex;align-items:baseline;gap:7px;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;padding:4px 8px;color:var(--htlb-text-2);font:inherit;font-size:12.5px;line-height:1.5;cursor:pointer}
.htlb-navitem:hover{background:var(--htlb-hover);color:var(--htlb-text)}
.htlb-navitem[data-on="1"]{background:color-mix(in srgb,var(--htlb-brand) 10%,transparent);color:var(--htlb-brand);font-weight:600}
.htlb-navnum{flex:none;width:16px;text-align:right;font-size:10.5px;color:var(--htlb-text-3);font-variant-numeric:tabular-nums}
.htlb-navtext{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.htlb-navcount{flex:none;font-size:10px;color:var(--htlb-text-3);font-variant-numeric:tabular-nums}
.htlb-main{flex:1;min-width:0;overflow:auto;overscroll-behavior:contain;padding:16px 22px 60px}
.htlb-wrap{max-width:840px;margin:0 auto}
.htlb-prose{color:var(--htlb-text)}
.htlb-prose>*:first-child{margin-top:0}
.htlb-prose p{margin:.55em 0;white-space:pre-line}
.htlb-prose h1,.htlb-prose h2,.htlb-prose h3,.htlb-prose h4{margin:1.25em 0 .45em;line-height:1.38;font-weight:650}
.htlb-prose h1{font-size:19px}
.htlb-prose h2{font-size:16px}
.htlb-prose h3{font-size:14.5px}
.htlb-prose h4{font-size:13.5px}
.htlb-prose ul,.htlb-prose ol{margin:.5em 0;padding-left:1.3em}
.htlb-prose li{margin:.22em 0;white-space:pre-line}
.htlb-prose strong{font-weight:650}
.htlb-prose a{color:var(--htlb-link);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--htlb-link) 35%,transparent)}
.htlb-prose a:hover{border-bottom-color:var(--htlb-link)}
.htlb-prose code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:var(--htlb-card);border:1px solid var(--htlb-line);border-radius:4px;padding:0 4px}
.htlb-prose blockquote{margin:.6em 0;padding:.1em 0 .1em 12px;border-left:2px solid var(--htlb-line-2);color:var(--htlb-text-2)}
.htlb-prose hr{border:0;border-top:1px solid var(--htlb-line);margin:1.1em 0}
.htlb-prose table{border-collapse:collapse;margin:.7em 0;font-size:12px;display:block;max-width:100%;overflow-x:auto}
.htlb-prose th,.htlb-prose td{border:1px solid var(--htlb-line);padding:5px 9px;text-align:left;vertical-align:top}
.htlb-prose th{background:var(--htlb-card);font-weight:600;white-space:nowrap}
.htlb-xref{font:inherit;color:var(--htlb-link);background:transparent;border:0;border-bottom:1px dashed color-mix(in srgb,var(--htlb-link) 50%,transparent);padding:0;cursor:pointer}
.htlb-xref:hover{border-bottom-style:solid}
.htlb-intro-head{padding-bottom:6px}
.htlb-h1{font-size:25px;line-height:1.32;margin:2px 0 6px;font-weight:700;letter-spacing:-.01em}
.htlb-sub{margin:0 0 10px;color:var(--htlb-text-2);font-size:13px}
.htlb-chips{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}
.htlb-tag{font-size:10.5px;line-height:18px;height:18px;padding:0 7px;border-radius:5px;border:1px solid var(--htlb-line-2);color:var(--htlb-text-2);white-space:nowrap;background:var(--htlb-bg)}
.htlb-tag[data-kind="A"]{color:var(--htlb-ok);border-color:color-mix(in srgb,var(--htlb-ok) 45%,transparent);background:color-mix(in srgb,var(--htlb-ok) 9%,transparent)}
.htlb-tag[data-kind="B"]{color:var(--htlb-warn);border-color:color-mix(in srgb,var(--htlb-warn) 45%,transparent);background:color-mix(in srgb,var(--htlb-warn) 9%,transparent)}
.htlb-tag[data-kind="C"]{color:var(--htlb-text-3)}
.htlb-tag[data-kind="top"]{color:var(--htlb-brand);border-color:color-mix(in srgb,var(--htlb-brand) 45%,transparent);background:color-mix(in srgb,var(--htlb-brand) 8%,transparent)}
.htlb-tag[data-kind="flag"]{color:var(--htlb-warn);border-color:color-mix(in srgb,var(--htlb-warn) 40%,transparent);background:color-mix(in srgb,var(--htlb-warn) 8%,transparent)}
.htlb-actions{display:flex;gap:8px;margin:6px 0 16px;flex-wrap:wrap}
.htlb-btn{height:28px;padding:0 12px;border-radius:7px;border:1px solid var(--htlb-line-2);background:var(--htlb-bg);color:var(--htlb-text);font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.htlb-btn:hover{background:var(--htlb-hover)}
.htlb-btn:disabled{opacity:.4;cursor:default}
.htlb-btn[data-primary="1"]{background:var(--htlb-brand);border-color:var(--htlb-brand);color:var(--dsw-alias-label-primary-foreground,#fff)}
.htlb-btn[data-primary="1"]:hover{filter:brightness(1.06)}
.htlb-btn-ghost{height:26px;padding:0 9px;font-size:11.5px;color:var(--htlb-text-2);border-color:var(--htlb-line)}
.htlb-linkbtn{font:inherit;font-size:inherit;color:var(--htlb-link);background:transparent;border:0;padding:0;cursor:pointer}
.htlb-questions{margin:22px 0 6px}
.htlb-sh2{font-size:15px;margin:0 0 8px;font-weight:650}
.htlb-qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px}
.htlb-q{display:flex;gap:8px;align-items:baseline;text-align:left;background:var(--htlb-card);border:1px solid var(--htlb-line);border-radius:8px;padding:7px 10px;font:inherit;font-size:12.5px;line-height:1.5;color:var(--htlb-text-2);cursor:pointer}
.htlb-q:hover{border-color:var(--htlb-line-2);color:var(--htlb-text)}
.htlb-qn{flex:none;font-size:10.5px;color:var(--htlb-text-3);font-variant-numeric:tabular-nums}
.htlb-sec{border:1px solid var(--htlb-line);border-radius:9px;margin:8px 0;background:var(--htlb-card)}
.htlb-sec>summary{cursor:pointer;padding:10px 13px;font-size:13px;font-weight:600;list-style:none;display:flex;align-items:center;gap:8px}
.htlb-sec>summary::-webkit-details-marker{display:none}
.htlb-sec>summary::before{content:"›";color:var(--htlb-text-3);font-size:15px;transition:transform .15s}
.htlb-sec[open]>summary::before{transform:rotate(90deg)}
.htlb-sec-body{padding:2px 13px 12px;border-top:1px solid var(--htlb-line);margin-top:2px}
.htlb-sec-body .htlb-prose{font-size:12.5px;color:var(--htlb-text-2)}
.htlb-foot{margin:26px 0 6px;padding-top:12px;border-top:1px solid var(--htlb-line);font-size:11px;color:var(--htlb-text-3);line-height:1.9}
.htlb-foot a{color:var(--htlb-link);text-decoration:none}
.htlb-foot a:hover{text-decoration:underline}
.htlb-chead{padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid var(--htlb-line)}
.htlb-cnum{font-size:11px;color:var(--htlb-brand);letter-spacing:.08em;font-weight:600}
.htlb-ctitle{margin:2px 0 8px;font-size:21px;line-height:1.35;font-weight:680;letter-spacing:-.005em}
.htlb-crow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.htlb-pager{display:flex;gap:6px;margin-left:auto}
.htlb-chintro{margin-bottom:16px;color:var(--htlb-text-2);font-size:12.8px}
.htlb-hint{font-size:12px;color:var(--htlb-text-3);margin:2px 0 10px;line-height:1.7}
.htlb-card{border:1px solid var(--htlb-line);border-radius:10px;background:var(--htlb-card);padding:13px 15px 10px;margin:0 0 11px}
.htlb-card-head{display:flex;gap:9px;align-items:baseline}
.htlb-card-no{flex:none;font-size:11px;color:var(--htlb-text-3);font-variant-numeric:tabular-nums;font-weight:600;letter-spacing:.02em}
.htlb-card-title{margin:0;font-size:14px;line-height:1.5;font-weight:650}
.htlb-card .htlb-chips{margin:7px 0 9px}
.htlb-plain{margin:0 0 9px;font-size:13.4px;line-height:1.75;white-space:pre-line}
.htlb-fact{display:flex;gap:9px;margin:0 0 5px;font-size:12.5px;line-height:1.7;color:var(--htlb-text-2)}
.htlb-fact>b{flex:none;font-weight:600;color:var(--htlb-text-3);font-size:11.5px;line-height:1.85;min-width:34px}
.htlb-factbody{min-width:0;flex:1}
.htlb-factbody p{margin:.15em 0}
.htlb-fold{margin-top:7px;border-top:1px dashed var(--htlb-line)}
.htlb-fold>summary{cursor:pointer;font-size:11.5px;color:var(--htlb-text-3);padding:6px 0 2px;list-style:none;display:flex;align-items:center;gap:5px}
.htlb-fold>summary::-webkit-details-marker{display:none}
.htlb-fold>summary::before{content:"+";font-weight:600;width:9px}
.htlb-fold[open]>summary::before{content:"\\2212"}
.htlb-chead .htlb-fold{border-top:0;margin-top:4px}
.htlb-fold-body{padding:3px 0 7px;font-size:12.5px;color:var(--htlb-text-2)}
.htlb-srcs{margin:0;padding-left:16px;font-size:12px;line-height:1.7}
.htlb-srcs li{margin:3px 0}
.htlb-srcs a{color:var(--htlb-link);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--htlb-link) 30%,transparent)}
.htlb-srcs a:hover{border-bottom-color:var(--htlb-link)}
.htlb-srcdot{margin-left:5px;font-size:10.5px;color:var(--htlb-text-3);border-bottom:0;opacity:.8}
.htlb-hit{display:block;width:100%;text-align:left;background:var(--htlb-card);border:1px solid var(--htlb-line);border-radius:9px;padding:10px 13px;margin:0 0 8px;font:inherit;color:var(--htlb-text);cursor:pointer}
.htlb-hit:hover{border-color:var(--htlb-brand)}
.htlb-hit .htlb-chips{margin:0 0 5px}
.htlb-hittitle{font-size:13.4px;font-weight:650;line-height:1.5;margin:0 0 3px}
.htlb-hitplain{font-size:12.2px;line-height:1.65;color:var(--htlb-text-2);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
mark.htlb-mark{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#96610a) 26%,transparent);color:inherit;border-radius:2px;padding:0 1px}
.htlb-empty{padding:34px 0;text-align:center;color:var(--htlb-text-3);font-size:12.5px}
.htlb-loadingrow{display:flex;gap:8px;align-items:center;color:var(--htlb-text-3);font-size:12px;padding:26px 0}
.htlb-dot{width:6px;height:6px;border-radius:50%;background:var(--htlb-brand);animation:htlb-pulse 1.1s ease-in-out infinite}
@keyframes htlb-pulse{0%,100%{opacity:.25}50%{opacity:1}}
.htlb-flash{animation:htlb-flash 1.6s ease-out}
@keyframes htlb-flash{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--htlb-brand) 55%,transparent)}22%{box-shadow:0 0 0 3px color-mix(in srgb,var(--htlb-brand) 55%,transparent)}100%{box-shadow:0 0 0 3px transparent}}
@container htlb (max-width:820px){
  .htlb-body{flex-direction:column}
  .htlb-nav{width:auto;display:flex;flex-direction:row;overflow-x:auto;overflow-y:hidden;border-right:0;border-bottom:1px solid var(--htlb-line);padding:6px 10px;gap:6px;flex:none;overscroll-behavior-x:contain}
  .htlb-navhead{display:none}
  .htlb-navitem{width:auto;flex:none;white-space:nowrap;padding:3px 9px}
  .htlb-navtext{overflow:visible;text-overflow:clip;max-width:210px}
  .htlb-navcount{display:none}
  .htlb-main{padding:14px 14px 52px}
  .htlb-head{padding:0 12px 8px}
  .htlb-stat{display:none}
  .htlb-h1{font-size:22px}
  .htlb-ctitle{font-size:18px}
}
`;

    // ------------------------------------------------------------------
    // 注册：侧栏图标（主面板的键）+ main 面板
    // ------------------------------------------------------------------

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, DICT), 'howtolivebetter: dictionaries');
      const t = ctx.locale.bind(NS);

      ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.plugin = 'dsh-howtolivebetter';
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, 'howtolivebetter: styles');

      ctx.slots.inject('sidebar.panellist', () => {
        const offPanel = ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            inject: () => ({ t }),
          },
          (owner) => h(PanelApp, { t: (owner && owner.t) || t }),
        );
        const offRow = ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: PANEL_ORDER,
            label: () => t(PANEL_LABEL_KEY),
            locale: NS,
          },
          (owner) => h(BookIcon, { size: (owner && owner.size) || 16 }),
        );
        return () => {
          offRow();
          offPanel();
        };
      });
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
