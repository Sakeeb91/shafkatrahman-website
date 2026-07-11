/* Accessible, force-directed article graph. Requires locally served D3 v7. */
(function () {
    'use strict';

    const graph = window.WRITING_GRAPH;
    const d3 = window.d3;
    if (!graph || !d3 || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return;

    const currentId = `article:${window.location.pathname}`;
    if (!graph.nodes.some((node) => node.id === currentId)) return;

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    const articleNodes = graph.nodes.filter((node) => node.type === 'article');
    const tagNodes = graph.nodes.filter((node) => node.type === 'tag');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastTrigger = null;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function svgElement(tag, attributes = {}) {
        const node = document.createElementNS(svgNamespace, tag);
        Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
        return node;
    }

    function shortLabel(label, maximum) {
        return label.length > maximum ? `${label.slice(0, maximum - 1).trim()}…` : label;
    }

    function hash(value) {
        let result = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            result ^= value.charCodeAt(index);
            result = Math.imul(result, 16777619);
        }
        return result >>> 0;
    }

    function initialPosition(node, index, total, width, height) {
        const angle = (index / Math.max(total, 1)) * Math.PI * 2 + (hash(node.id) % 100) / 250;
        const radius = Math.min(width, height) * (node.type === 'article' ? 0.27 : 0.38);
        return {
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius
        };
    }

    function createGraphSvg(sourceNodes, sourceEdges, options = {}) {
        const width = options.width || 900;
        const height = options.height || 580;
        const compact = Boolean(options.compact);
        const nodes = sourceNodes.map((node, index) => ({
            ...node,
            ...initialPosition(node, index, sourceNodes.length, width, height)
        }));
        const edges = sourceEdges.map((edge) => ({ ...edge }));
        const nodesById = new Map(nodes.map((node) => [node.id, node]));
        const articleTagIds = new Map();
        const tagArticleIds = new Map();
        edges.filter((edge) => edge.type === 'tag').forEach((edge) => {
            const articleId = edge.source.startsWith('article:') ? edge.source : edge.target;
            const tagId = edge.source.startsWith('tag:') ? edge.source : edge.target;
            if (!articleTagIds.has(articleId)) articleTagIds.set(articleId, new Set());
            if (!tagArticleIds.has(tagId)) tagArticleIds.set(tagId, new Set());
            articleTagIds.get(articleId).add(tagId);
            tagArticleIds.get(tagId).add(articleId);
        });

        const svg = svgElement('svg', {
            class: compact ? 'writing-graph-svg writing-graph-svg-compact' : 'writing-graph-svg',
            viewBox: `0 0 ${width} ${height}`,
            role: 'group',
            'aria-label': compact ? 'Local map of this article and directly related articles' : 'Interactive map of articles and their relationships'
        });
        const viewport = svgElement('g', { class: 'writing-graph-viewport' });
        const edgeLayer = svgElement('g', { class: 'writing-graph-edges', 'aria-hidden': 'true' });
        const nodeLayer = svgElement('g', { class: 'writing-graph-nodes' });
        viewport.append(edgeLayer, nodeLayer);
        svg.appendChild(viewport);

        const edgeElements = edges.map((edge) => {
            const line = svgElement('line', {
                class: `writing-graph-edge writing-graph-edge-${edge.type}`,
                'data-source': typeof edge.source === 'string' ? edge.source : edge.source.id,
                'data-target': typeof edge.target === 'string' ? edge.target : edge.target.id,
                'data-edge-type': edge.type
            });
            edgeLayer.appendChild(line);
            return line;
        });

        const nodeElements = new Map();
        nodes.forEach((node) => {
            const group = svgElement('g', {
                class: `writing-graph-node writing-graph-node-${node.type}${node.id === currentId ? ' writing-graph-node-current' : ''}`,
                tabindex: '0',
                role: 'button',
                'aria-pressed': 'false',
                'aria-label': node.type === 'article'
                    ? `${node.label}. Press Enter to open. Press Space to show its tags. Use arrow keys to move and pin it.`
                    : `${node.label} tag. Press Enter or Space to highlight connected articles. Use arrow keys to move and pin it.`,
                'data-node-id': node.id
            });
            group.appendChild(svgElement('circle', { class: 'writing-graph-node-hit', r: compact ? 13 : 17 }));
            group.appendChild(svgElement('circle', { r: node.id === currentId ? 10 : node.type === 'article' ? 7 : 4.5 }));
            const label = svgElement('text', {
                x: node.type === 'article' ? 11 : 8,
                y: 4,
                class: 'writing-graph-node-label'
            });
            label.textContent = shortLabel(node.label, compact ? 20 : node.type === 'article' ? 36 : 24);
            group.appendChild(label);
            nodeLayer.appendChild(group);
            nodeElements.set(node.id, group);
        });

        let hoveredArticle = '';
        let selectedArticle = '';
        let selectedTag = '';
        let movedByDrag = false;
        let activeDrag = false;

        function connectedSet() {
            if (selectedTag) return new Set([selectedTag, ...(tagArticleIds.get(selectedTag) || [])]);
            return null;
        }

        function revealedTags() {
            const revealed = new Set();
            [hoveredArticle, selectedArticle].filter(Boolean).forEach((articleId) => {
                (articleTagIds.get(articleId) || []).forEach((tagId) => revealed.add(tagId));
            });
            if (selectedTag) revealed.add(selectedTag);
            return revealed;
        }

        function updateVisibility(message) {
            const tags = revealedTags();
            const connected = connectedSet();
            nodeElements.forEach((group, id) => {
                const node = nodesById.get(id);
                const visible = node.type === 'article' || tags.has(id);
                group.classList.toggle('writing-graph-hidden', !visible);
                group.classList.toggle('writing-graph-selected', id === selectedArticle || id === selectedTag);
                group.classList.toggle('writing-graph-dimmed', Boolean(connected) && visible && !connected.has(id));
                group.setAttribute('aria-pressed', String(id === selectedArticle || id === selectedTag));
                group.setAttribute('aria-hidden', String(!visible));
                group.setAttribute('tabindex', visible ? '0' : '-1');
            });
            edgeElements.forEach((line) => {
                const sourceId = line.dataset.source;
                const targetId = line.dataset.target;
                const tagEdge = line.dataset.edgeType === 'tag';
                const edgeTagId = sourceId.startsWith('tag:') ? sourceId : targetId;
                const edgeArticleId = sourceId.startsWith('article:') ? sourceId : targetId;
                const visible = !tagEdge || (selectedTag
                    ? edgeTagId === selectedTag
                    : tags.has(edgeTagId) && (edgeArticleId === hoveredArticle || edgeArticleId === selectedArticle));
                line.classList.toggle('writing-graph-hidden', !visible);
                line.classList.toggle('writing-graph-dimmed', Boolean(connected) && visible && !connected.has(sourceId) && !connected.has(targetId));
            });
            if (options.onStateChange) options.onStateChange({ selectedArticle, selectedTag, message });
        }

        function selectArticle(node, force) {
            selectedTag = '';
            selectedArticle = force === true ? node.id : force === false || selectedArticle === node.id ? '' : node.id;
            updateVisibility(selectedArticle ? `Showing tags for ${node.label}.` : 'Showing article relationships only.');
        }

        function selectTag(node, force) {
            selectedArticle = '';
            selectedTag = force === true ? node.id : force === false || selectedTag === node.id ? '' : node.id;
            updateVisibility(selectedTag ? `Showing articles tagged ${node.label}.` : 'Showing article relationships only.');
        }

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id((node) => node.id)
                .distance((edge) => edge.type === 'tag' ? 74 : edge.type === 'related' ? 180 : 145)
                .strength((edge) => edge.type === 'tag' ? 0.34 : 0.6))
            .force('charge', d3.forceManyBody().strength((node) => node.type === 'article' ? -360 : -95))
            .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
            .force('x', d3.forceX(width / 2).strength(0.055))
            .force('y', d3.forceY(height / 2).strength(0.065))
            .force('collide', d3.forceCollide().radius((node) => node.type === 'article' ? 34 : 18).iterations(2))
            .alphaDecay(0.035)
            .velocityDecay(0.34);

        function clamp(node) {
            const rightInset = node.type === 'article' ? (compact ? 88 : 210) : 70;
            node.x = Math.max(42, Math.min(width - rightInset, node.x));
            node.y = Math.max(compact ? 20 : 44, Math.min(height - 32, node.y));
        }

        function render() {
            nodes.forEach((node) => {
                clamp(node);
                nodeElements.get(node.id).setAttribute('transform', `translate(${node.x} ${node.y})`);
            });
            edges.forEach((edge, index) => {
                const source = typeof edge.source === 'string' ? nodesById.get(edge.source) : edge.source;
                const target = typeof edge.target === 'string' ? nodesById.get(edge.target) : edge.target;
                edgeElements[index].setAttribute('x1', source.x);
                edgeElements[index].setAttribute('y1', source.y);
                edgeElements[index].setAttribute('x2', target.x);
                edgeElements[index].setAttribute('y2', target.y);
            });
        }

        function reheat(alpha = 0.55) {
            if (reduceMotion) {
                simulation.alpha(alpha);
                simulation.tick(180);
                simulation.stop();
                render();
            } else {
                simulation.alpha(alpha).restart();
            }
        }

        simulation.on('tick', render).on('end', () => simulation.stop());
        if (reduceMotion) {
            simulation.stop();
            simulation.tick(320);
            render();
        }

        const drag = d3.drag()
            .filter((event) => event.button === 0)
            .clickDistance(4)
            .on('start', function (event, node) {
                activeDrag = true;
                movedByDrag = false;
                if (!reduceMotion) simulation.alphaTarget(0.22).restart();
                node.fx = node.x;
                node.fy = node.y;
                this.classList.add('is-dragging');
                this.focus();
                updateVisibility(`Moving ${node.label}. Release to pin it.`);
            })
            .on('drag', function (event, node) {
                movedByDrag = true;
                node.fx = event.x;
                node.fy = event.y;
                clamp(node);
                node.fx = node.x;
                node.fy = node.y;
                if (reduceMotion) reheat(0.32);
            })
            .on('end', function (event, node) {
                activeDrag = false;
                if (!reduceMotion) simulation.alphaTarget(0).alpha(0.42).restart();
                this.classList.remove('is-dragging');
                updateVisibility(`${node.label} is pinned. Double-click it to release.`);
            });

        d3.select(nodeLayer).selectAll('.writing-graph-node').data(nodes).call(drag);

        nodes.forEach((node) => {
            const group = nodeElements.get(node.id);
            group.addEventListener('pointerenter', () => {
                if (node.type === 'article') {
                    hoveredArticle = node.id;
                    updateVisibility(`Previewing tags for ${node.label}.`);
                }
            });
            group.addEventListener('pointerleave', () => {
                if (node.type === 'article' && hoveredArticle === node.id) {
                    hoveredArticle = '';
                    updateVisibility();
                }
            });
            group.addEventListener('focus', () => {
                if (node.type === 'article') {
                    hoveredArticle = node.id;
                    updateVisibility(`Previewing tags for ${node.label}.`);
                }
            });
            group.addEventListener('blur', () => {
                if (node.type === 'article' && hoveredArticle === node.id) {
                    hoveredArticle = '';
                    updateVisibility();
                }
            });
            group.addEventListener('click', (event) => {
                event.preventDefault();
                if (activeDrag || movedByDrag) {
                    movedByDrag = false;
                    return;
                }
                if (compact) {
                    openDialog(group);
                } else if (node.type === 'article') {
                    selectArticle(node);
                } else {
                    selectTag(node);
                }
            });
            group.addEventListener('dblclick', (event) => {
                event.preventDefault();
                node.fx = null;
                node.fy = null;
                reheat(0.65);
                updateVisibility(`${node.label} was released into the graph.`);
            });
            group.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (compact) openDialog(group);
                    else if (node.type === 'article') window.location.href = node.path;
                    else selectTag(node);
                    return;
                }
                if (event.key === ' ') {
                    event.preventDefault();
                    if (compact) openDialog(group);
                    else if (node.type === 'article') selectArticle(node);
                    else selectTag(node);
                    return;
                }
                if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
                event.preventDefault();
                const step = event.shiftKey ? 20 : 8;
                node.fx = node.fx == null ? node.x : node.fx;
                node.fy = node.fy == null ? node.y : node.fy;
                if (event.key === 'ArrowLeft') node.fx -= step;
                if (event.key === 'ArrowRight') node.fx += step;
                if (event.key === 'ArrowUp') node.fy -= step;
                if (event.key === 'ArrowDown') node.fy += step;
                node.x = node.fx;
                node.y = node.fy;
                clamp(node);
                node.fx = node.x;
                node.fy = node.y;
                reheat(0.38);
                updateVisibility(`${node.label} moved and pinned.`);
            });
        });

        function resetLayout() {
            hoveredArticle = '';
            selectedArticle = '';
            selectedTag = '';
            nodes.forEach((node, index) => {
                const position = initialPosition(node, index, nodes.length, width, height);
                node.x = position.x;
                node.y = position.y;
                node.vx = 0;
                node.vy = 0;
                node.fx = null;
                node.fy = null;
            });
            updateVisibility('Graph reset. Showing article relationships only.');
            reheat(1);
        }

        updateVisibility('Showing article relationships only.');
        if (!compact) enablePan(svg, resetLayout);
        svg.graphState = {
            reset: resetLayout,
            selectNode(id) {
                const node = nodesById.get(id);
                if (!node) return;
                if (node.type === 'article') selectArticle(node, true);
                else selectTag(node, true);
                nodeElements.get(id).focus();
            },
            selectedArticle: () => selectedArticle
        };
        return svg;
    }

    function enablePan(svg, resetLayout) {
        let view = { x: 0, y: 0, width: 900, height: 580 };
        let pan = null;
        function applyView() { svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`); }

        svg.addEventListener('wheel', (event) => {
            event.preventDefault();
            svg.graphView.zoom(event.deltaY > 0 ? 1.12 : 0.89);
        }, { passive: false });
        svg.addEventListener('pointerdown', (event) => {
            if (event.target.closest('.writing-graph-node')) return;
            pan = { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
            svg.setPointerCapture(event.pointerId);
            svg.classList.add('is-panning');
        });
        svg.addEventListener('pointermove', (event) => {
            if (!pan) return;
            view.x = pan.viewX - (event.clientX - pan.x) * view.width / Math.max(svg.clientWidth, 1);
            view.y = pan.viewY - (event.clientY - pan.y) * view.height / Math.max(svg.clientHeight, 1);
            applyView();
        });
        function endPan() { pan = null; svg.classList.remove('is-panning'); }
        svg.addEventListener('pointerup', endPan);
        svg.addEventListener('pointercancel', endPan);

        svg.graphView = {
            zoom(factor) {
                const nextWidth = Math.max(360, Math.min(1200, view.width * factor));
                const nextHeight = nextWidth * (580 / 900);
                view.x += (view.width - nextWidth) / 2;
                view.y += (view.height - nextHeight) / 2;
                view.width = nextWidth;
                view.height = nextHeight;
                applyView();
            },
            reset() {
                view = { x: 0, y: 0, width: 900, height: 580 };
                resetLayout();
                applyView();
            }
        };
    }

    function localGraphData() {
        const articleIds = new Set([currentId]);
        graph.edges.filter((edge) => edge.type !== 'tag').forEach((edge) => {
            if (edge.source === currentId) articleIds.add(edge.target);
            if (edge.target === currentId) articleIds.add(edge.source);
        });
        const tagIds = new Set();
        graph.edges.filter((edge) => edge.type === 'tag').forEach((edge) => {
            if (articleIds.has(edge.source)) tagIds.add(edge.target);
            if (articleIds.has(edge.target)) tagIds.add(edge.source);
        });
        const ids = new Set([...articleIds, ...tagIds]);
        return {
            nodes: graph.nodes.filter((node) => ids.has(node.id)),
            edges: graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))
        };
    }

    function createSemanticFallback() {
        const details = element('details', 'writing-graph-fallback');
        details.appendChild(element('summary', '', 'Browse as a list'));
        const columns = element('div', 'writing-graph-fallback-columns');
        const articleSection = element('section');
        articleSection.appendChild(element('h3', '', 'Articles'));
        const articleList = element('ul');
        articleNodes.forEach((node) => {
            const item = element('li');
            const link = element('a', '', node.label);
            link.href = node.path;
            item.appendChild(link);
            articleList.appendChild(item);
        });
        articleSection.appendChild(articleList);
        const tagSection = element('section');
        tagSection.appendChild(element('h3', '', 'Tags'));
        const tagList = element('ul');
        tagNodes.forEach((node) => {
            const item = element('li');
            const button = element('button', 'writing-graph-tag-button', node.label);
            button.type = 'button';
            button.addEventListener('click', () => {
                const svg = document.querySelector('.writing-graph-dialog .writing-graph-svg');
                if (svg) svg.graphState.selectNode(node.id);
            });
            item.appendChild(button);
            tagList.appendChild(item);
        });
        tagSection.appendChild(tagList);
        columns.append(articleSection, tagSection);
        details.appendChild(columns);
        return details;
    }

    function trapFocus(event, dialog) {
        if (event.key === 'Escape') { event.preventDefault(); dialog.close(); return; }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(dialog.querySelectorAll('button, input, a[href], summary, [tabindex="0"]'))
            .filter((node) => !node.hasAttribute('disabled') && node.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    function createDialog() {
        const dialog = element('dialog', 'writing-graph-dialog');
        dialog.setAttribute('aria-labelledby', 'writing-graph-title');
        const shell = element('div', 'writing-graph-dialog-shell');
        const header = element('header', 'writing-graph-dialog-header');
        const headingGroup = element('div');
        const title = element('h2', '', 'Writing graph');
        title.id = 'writing-graph-title';
        headingGroup.append(title, element('p', '', 'Article relationships first. Reveal tags as you explore.'));
        const controls = element('div', 'writing-graph-controls');
        const searchLabel = element('label', 'writing-graph-search-label', 'Find');
        const search = element('input', 'writing-graph-search');
        search.type = 'search';
        search.placeholder = 'Article or tag';
        search.setAttribute('list', 'writing-graph-options');
        const datalist = element('datalist');
        datalist.id = 'writing-graph-options';
        graph.nodes.forEach((node) => {
            const option = element('option');
            option.value = node.label;
            datalist.appendChild(option);
        });
        searchLabel.appendChild(search);
        const zoomOut = element('button', '', 'Zoom out');
        const zoomIn = element('button', '', 'Zoom in');
        const reset = element('button', '', 'Reset');
        const openSelected = element('button', '', 'Open selected');
        openSelected.disabled = true;
        const close = element('button', 'writing-graph-close', 'Close');
        [zoomOut, zoomIn, reset, openSelected, close].forEach((button) => { button.type = 'button'; });
        controls.append(searchLabel, datalist, zoomOut, zoomIn, reset, openSelected, close);
        header.append(headingGroup, controls);
        const canvas = element('div', 'writing-graph-canvas');
        const status = element('p', 'writing-graph-status', 'Showing article relationships only.');
        status.setAttribute('aria-live', 'polite');
        const svg = createGraphSvg(graph.nodes, graph.edges, {
            onStateChange(state) {
                if (state.message) status.textContent = state.message;
                const selected = state.selectedArticle ? nodeById.get(state.selectedArticle) : null;
                openSelected.disabled = !selected;
                openSelected.dataset.path = selected ? selected.path : '';
            }
        });
        canvas.appendChild(svg);
        const legend = element('div', 'writing-graph-legend');
        legend.innerHTML = '<span><i class="legend-article"></i>Article</span><span><i class="legend-tag"></i>Revealed tag</span><span><i class="legend-related"></i>Reviewed relationship</span>';
        shell.append(header, canvas, legend, status, createSemanticFallback());
        dialog.appendChild(shell);

        function selectSearchResult() {
            const value = search.value.trim().toLowerCase();
            const node = graph.nodes.find((item) => item.label.toLowerCase() === value);
            if (node) svg.graphState.selectNode(node.id);
        }
        search.addEventListener('change', selectSearchResult);
        search.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); selectSearchResult(); }
        });
        zoomOut.addEventListener('click', () => svg.graphView.zoom(1.2));
        zoomIn.addEventListener('click', () => svg.graphView.zoom(0.8));
        reset.addEventListener('click', () => { search.value = ''; svg.graphView.reset(); });
        openSelected.addEventListener('click', () => { if (openSelected.dataset.path) window.location.href = openSelected.dataset.path; });
        close.addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
        dialog.addEventListener('close', () => { if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus(); });
        dialog.addEventListener('keydown', (event) => trapFocus(event, dialog));
        document.body.appendChild(dialog);
        return dialog;
    }

    const dialog = createDialog();
    function openDialog(trigger) {
        lastTrigger = trigger;
        if (!dialog.open) dialog.showModal();
        const close = dialog.querySelector('.writing-graph-close');
        if (close) close.focus();
    }

    function createLauncher() {
        const local = localGraphData();
        const launcher = element('aside', 'writing-graph-launcher');
        launcher.setAttribute('aria-label', 'Writing graph');
        const preview = element('div', 'writing-graph-preview');
        const heading = element('div', 'writing-graph-preview-heading');
        heading.append(element('p', '', 'Connected ideas'));
        const expand = element('button', 'writing-graph-expand', 'Expand');
        expand.type = 'button';
        expand.addEventListener('click', () => openDialog(expand));
        heading.appendChild(expand);
        preview.append(heading, createGraphSvg(local.nodes, local.edges, { width: 240, height: 150, compact: true }));
        const compactButton = element('button', 'writing-graph-compact-button', 'Open writing graph');
        compactButton.type = 'button';
        compactButton.addEventListener('click', () => openDialog(compactButton));
        launcher.append(preview, compactButton);
        document.body.appendChild(launcher);
    }

    createLauncher();
}());
