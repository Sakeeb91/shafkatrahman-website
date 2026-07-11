/* Interactive article and tag graph. Loaded only on registered writing pages. */
(function () {
    'use strict';

    const graph = window.WRITING_GRAPH;
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return;

    const currentPath = window.location.pathname;
    const currentId = `article:${currentPath}`;
    if (!graph.nodes.some((node) => node.id === currentId)) return;

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    const articleNodes = graph.nodes.filter((node) => node.type === 'article');
    const tagNodes = graph.nodes.filter((node) => node.type === 'tag');
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

    function layout(nodes, edges, width, height) {
        const positioned = nodes.map((node, index) => {
            const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2 + (hash(node.id) % 100) / 250;
            const radius = Math.min(width, height) * (node.type === 'article' ? 0.27 : 0.38);
            return {
                ...node,
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0
            };
        });
        const positions = new Map(positioned.map((node) => [node.id, node]));

        for (let tick = 0; tick < 180; tick += 1) {
            const cooling = 1 - tick / 180;

            for (let left = 0; left < positioned.length; left += 1) {
                for (let right = left + 1; right < positioned.length; right += 1) {
                    const a = positioned[left];
                    const b = positioned[right];
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;
                    const distanceSquared = Math.max(dx * dx + dy * dy, 36);
                    const distance = Math.sqrt(distanceSquared);
                    const repulsion = (a.type === 'article' && b.type === 'article' ? 4400 : 860) / distanceSquared;
                    dx /= distance;
                    dy /= distance;
                    a.vx -= dx * repulsion;
                    a.vy -= dy * repulsion;
                    b.vx += dx * repulsion;
                    b.vy += dy * repulsion;
                }
            }

            edges.forEach((edge) => {
                const source = positions.get(edge.source);
                const target = positions.get(edge.target);
                if (!source || !target) return;
                let dx = target.x - source.x;
                let dy = target.y - source.y;
                const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                const desired = edge.type === 'tag' ? 72 : edge.type === 'related' ? 168 : 140;
                const pull = (distance - desired) * 0.006;
                dx /= distance;
                dy /= distance;
                source.vx += dx * pull;
                source.vy += dy * pull;
                target.vx -= dx * pull;
                target.vy -= dy * pull;
            });

            positioned.forEach((node) => {
                node.vx += (width / 2 - node.x) * 0.0009;
                node.vy += (height / 2 - node.y) * 0.0009;
                node.vx *= 0.82;
                node.vy *= 0.82;
                node.x = Math.max(34, Math.min(width - 34, node.x + node.vx * cooling));
                node.y = Math.max(28, Math.min(height - 28, node.y + node.vy * cooling));
            });
        }

        return positioned;
    }

    function createGraphSvg(nodes, edges, options = {}) {
        const width = options.width || 900;
        const height = options.height || 580;
        const compact = Boolean(options.compact);
        const positioned = layout(nodes, edges, width, height);
        const positions = new Map(positioned.map((node) => [node.id, node]));
        const degree = new Map(nodes.map((node) => [node.id, 0]));
        edges.forEach((edge) => {
            degree.set(edge.source, (degree.get(edge.source) || 0) + 1);
            degree.set(edge.target, (degree.get(edge.target) || 0) + 1);
        });
        const svg = svgElement('svg', {
            class: compact ? 'writing-graph-svg writing-graph-svg-compact' : 'writing-graph-svg',
            viewBox: `0 0 ${width} ${height}`,
            role: 'img',
            'aria-label': compact ? 'Local map of this article and its connections' : 'Interactive map of articles and tags'
        });
        const viewport = svgElement('g', { class: 'writing-graph-viewport' });
        const edgeLayer = svgElement('g', { class: 'writing-graph-edges' });
        const nodeLayer = svgElement('g', { class: 'writing-graph-nodes' });
        viewport.append(edgeLayer, nodeLayer);
        svg.appendChild(viewport);

        edges.forEach((edge) => {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);
            if (!source || !target) return;
            edgeLayer.appendChild(svgElement('line', {
                x1: source.x,
                y1: source.y,
                x2: target.x,
                y2: target.y,
                class: `writing-graph-edge writing-graph-edge-${edge.type}`,
                'data-source': edge.source,
                'data-target': edge.target
            }));
        });

        positioned.forEach((node) => {
            const group = svgElement('a', {
                class: `writing-graph-node writing-graph-node-${node.type}${node.id === currentId ? ' writing-graph-node-current' : ''}${node.type === 'tag' && degree.get(node.id) > 1 ? ' writing-graph-node-connected' : ''}`,
                transform: `translate(${node.x} ${node.y})`,
                href: node.type === 'article' ? node.path : '#writing-graph-title',
                tabindex: '0',
                role: 'button',
                'aria-label': node.type === 'article' ? `Open ${node.label}` : `Highlight articles tagged ${node.label}`,
                'data-node-id': node.id
            });
            group.appendChild(svgElement('circle', { class: 'writing-graph-node-hit', r: compact ? 11 : 15 }));
            group.appendChild(svgElement('circle', { r: node.id === currentId ? 10 : node.type === 'article' ? 7 : 4.5 }));

            const showLabel = !compact || node.id === currentId || node.type === 'tag';
            if (showLabel) {
                const label = svgElement('text', {
                    x: node.type === 'article' ? 11 : 8,
                    y: 4,
                    class: 'writing-graph-node-label'
                });
                label.textContent = shortLabel(node.label, compact ? 20 : node.type === 'article' ? 36 : 24);
                group.appendChild(label);
            }

            const activate = (event) => {
                if (event) event.preventDefault();
                if (compact) {
                    openDialog(group);
                } else if (node.type === 'article') {
                    window.location.href = node.path;
                } else {
                    toggleTagHighlight(node.id, svg);
                }
            };
            group.addEventListener('click', activate);
            group.addEventListener('keydown', (event) => {
                if (event.key === ' ') {
                    event.preventDefault();
                    activate(event);
                }
            });
            nodeLayer.appendChild(group);
        });

        if (!compact) enablePan(svg);
        return svg;
    }

    function toggleTagHighlight(tagNodeId, svg) {
        const selected = svg.dataset.selectedTag === tagNodeId ? '' : tagNodeId;
        svg.dataset.selectedTag = selected;
        const connected = new Set([tagNodeId]);
        if (selected) {
            graph.edges.forEach((edge) => {
                if (edge.type === 'tag' && (edge.source === tagNodeId || edge.target === tagNodeId)) {
                    connected.add(edge.source);
                    connected.add(edge.target);
                }
            });
        }
        svg.querySelectorAll('.writing-graph-node').forEach((node) => {
            node.classList.toggle('writing-graph-dimmed', Boolean(selected) && !connected.has(node.dataset.nodeId));
            node.classList.toggle('writing-graph-selected', Boolean(selected) && node.dataset.nodeId === selected);
        });
        svg.querySelectorAll('.writing-graph-edge').forEach((edge) => {
            edge.classList.toggle('writing-graph-dimmed', Boolean(selected) && edge.dataset.source !== selected && edge.dataset.target !== selected);
        });
        const status = document.querySelector('.writing-graph-status');
        if (status) status.textContent = selected ? `Showing articles tagged ${nodeById.get(selected).label}.` : 'Showing all articles and tags.';
    }

    function enablePan(svg) {
        let view = { x: 0, y: 0, width: 900, height: 580 };
        let drag = null;

        function applyView() {
            svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`);
        }

        svg.addEventListener('pointerdown', (event) => {
            if (event.target.closest('.writing-graph-node')) return;
            drag = { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
            svg.setPointerCapture(event.pointerId);
            svg.classList.add('is-panning');
        });
        svg.addEventListener('pointermove', (event) => {
            if (!drag) return;
            const scaleX = view.width / Math.max(svg.clientWidth, 1);
            const scaleY = view.height / Math.max(svg.clientHeight, 1);
            view.x = drag.viewX - (event.clientX - drag.x) * scaleX;
            view.y = drag.viewY - (event.clientY - drag.y) * scaleY;
            applyView();
        });
        svg.addEventListener('pointerup', () => {
            drag = null;
            svg.classList.remove('is-panning');
        });

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
                svg.dataset.selectedTag = '';
                svg.querySelectorAll('.writing-graph-dimmed, .writing-graph-selected').forEach((node) => {
                    node.classList.remove('writing-graph-dimmed', 'writing-graph-selected');
                });
                const status = document.querySelector('.writing-graph-status');
                if (status) status.textContent = 'Showing all articles and tags.';
                applyView();
            }
        };
    }

    function localGraphData() {
        const ids = new Set([currentId]);
        graph.edges.forEach((edge) => {
            if (edge.source === currentId || edge.target === currentId) {
                ids.add(edge.source);
                ids.add(edge.target);
            }
        });
        const currentTags = new Set(Array.from(ids).filter((id) => id.startsWith('tag:')));
        graph.edges.forEach((edge) => {
            if (edge.type === 'tag' && (currentTags.has(edge.source) || currentTags.has(edge.target))) {
                ids.add(edge.source);
                ids.add(edge.target);
            }
        });
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
                if (svg) toggleTagHighlight(node.id, svg);
            });
            item.appendChild(button);
            tagList.appendChild(item);
        });
        tagSection.appendChild(tagList);
        columns.append(articleSection, tagSection);
        details.appendChild(columns);
        return details;
    }

    function createDialog() {
        const dialog = element('dialog', 'writing-graph-dialog');
        dialog.setAttribute('aria-labelledby', 'writing-graph-title');
        const shell = element('div', 'writing-graph-dialog-shell');
        const header = element('header', 'writing-graph-dialog-header');
        const headingGroup = element('div');
        const title = element('h2', '', 'Writing graph');
        title.id = 'writing-graph-title';
        headingGroup.append(title, element('p', '', 'Articles, research, and the ideas that connect them.'));

        const controls = element('div', 'writing-graph-controls');
        const zoomOut = element('button', '', 'Zoom out');
        const zoomIn = element('button', '', 'Zoom in');
        const reset = element('button', '', 'Reset');
        const close = element('button', 'writing-graph-close', 'Close');
        [zoomOut, zoomIn, reset, close].forEach((button) => { button.type = 'button'; });
        controls.append(zoomOut, zoomIn, reset, close);
        header.append(headingGroup, controls);

        const canvas = element('div', 'writing-graph-canvas');
        const svg = createGraphSvg(graph.nodes, graph.edges);
        canvas.appendChild(svg);

        const legend = element('div', 'writing-graph-legend');
        legend.innerHTML = '<span><i class="legend-article"></i>Article</span><span><i class="legend-tag"></i>Tag</span><span><i class="legend-related"></i>Reviewed relationship</span>';
        const status = element('p', 'writing-graph-status', 'Showing all articles and tags.');
        status.setAttribute('aria-live', 'polite');
        shell.append(header, canvas, legend, status, createSemanticFallback());
        dialog.appendChild(shell);

        zoomOut.addEventListener('click', () => svg.graphView.zoom(1.2));
        zoomIn.addEventListener('click', () => svg.graphView.zoom(0.8));
        reset.addEventListener('click', () => svg.graphView.reset());
        close.addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });
        dialog.addEventListener('close', () => {
            if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
        });
        dialog.addEventListener('keydown', (event) => trapFocus(event, dialog));
        document.body.appendChild(dialog);
        return dialog;
    }

    function trapFocus(event, dialog) {
        if (event.key === 'Escape') {
            event.preventDefault();
            dialog.close();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(dialog.querySelectorAll('button, a[href], summary, [tabindex="0"]'))
            .filter((node) => !node.hasAttribute('disabled') && node.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
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
