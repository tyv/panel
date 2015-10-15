({
    block: 'page',
    js: true,
    title: 'Title of the page',
    favicon: '/favicon.ico',
    head: [
        { elem: 'meta', attrs: { name: 'description', content: '' } },
        { elem: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1' } },
        { elem: 'css', url: '_index.css' }
    ],
    scripts: [{ elem: 'js', url: '_index.js' }],
    content: {
        block: 'mesosphere',
        js: true,
        content: [
            {
                block: 'layout',
                content: [{
                    elem: 'left',
                    content: [
                        {
                            block: 'control-pane'
                        },
                        {
                            block: 'apps'
                        }
                    ]
                },
                {
                    elem: 'right',
                    content: [
                        {
                            block: 'server-canvas'
                        }
                    ]
                }]
            }

        ]
    }
})
