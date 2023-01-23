/* global require process __dirname  module*/
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const path = require('path');
const outputFolder = process.env.NODE_ENV === 'preview' ? 'docs/' : process.env.NODE_ENV === 'localpreview' ? 'preview/' : 'dist/';
const isDev = mode === 'development';
const isProd = process.env.NODE_ENV === 'production';
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const pretty = require('pretty');
const {sass} = require('svelte-preprocess-sass');

const repoName = 'pa-retirement';
const publicPath = isProd ? '/~/media/data-visualizations/interactives/2023/pa-retirement/' : '';

const copyWebpack =
    new CopyWebpackPlugin([{
        from: '-/',
        context: 'src',
        to: '-/'
    }, {
        from: 'data/',
        context: 'src',
        to: 'data/'
    }, {
        from: 'assets/',
        context: 'src',
        to: 'assets/',
        ignore: ['Pew/css/**/*.*']
    }, {
        from: 'assets/Pew/css/',
        context: 'src',
        to: 'assets/Pew/css/',
        transform(content) {
            if (process.env.NODE_ENV === 'preview') {
                // this modifies the content of the files being copied; here making sure url('/...') is changed so that it will
                // work on gitHub pages where oublic path is /{repoName}/
                // also changes references to 'pew' to refer to 'Pew'
                return content.toString().replace(/url\("\/([^/])/g, 'url("/' + repoName + '/$1').replace(/\/pew\//g, '/Pew/');
            } else {
                return content.toString();
            }
        }
    }]);
const prerender = 
    new PrerenderSPAPlugin({
         // Required - The path to the webpack-outputted app to prerender.
         staticDir: path.join(__dirname, outputFolder),
         // Required - Routes to render.
         routes: ['/'],
         renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
             defaultViewport: null,
             headless: false,
             inject: true,
             injectProperty: 'IS_PRERENDERING',
             //renderAfterTime: 30000
             renderAfterDocumentEvent: 'custom-render-trigger'
         }),
         postProcess: function(renderedRoute){
             renderedRoute.html = renderedRoute.html.replace(/class="emitted-css" href="(.*?)"/,'class="emitted-css" href="' + publicPath + '$1' + '"');
             renderedRoute.html = renderedRoute.html.replace(/class="emitted-bundle" src="(.*?)"/g,'class="emitted-bundle" src="' + publicPath + '$1' + '"');
             if (isProd){
                 renderedRoute.html = renderedRoute.html.replace(/<head>[\s\S]*.*<\/head>/,'').replace(/<\/?html.*?>|<\/?body.*?>/g,'');
             }
             renderedRoute.html = pretty(renderedRoute.html);
             return renderedRoute;
         }
 });
const devToolPlugins = [new webpack.SourceMapDevToolPlugin({
    test: /\.js/,
    filename: '[name]js.map',
    module: true,
    moduleFilenameTemplate: info => {
        console.log(info);
        return `webpack:///${info.resourcePath}?${info.hash}`;
    },
}), new webpack.SourceMapDevToolPlugin({
    test: /\.css/,
    filename: '[name]css.map',
    module: true,
    moduleFilenameTemplate: info => {
        console.log(info);
        return `webpack:///${info.resourcePath}?${info.hash}`;
    },
})];
const plugins = [
    new HtmlWebpackPlugin({
        title: 'Pennsylvania’s looming $17.8 billion fiscal shortfall',
        subtitle: 'An interactive look at how Pennsylvania’s retirement savings crisis is straining the Commonwealth’s safety net',
        template: isProd ? './src/index.html' : './src/index-dev.html',
        inject: false,
    }),
    new MiniCssExtractPlugin({
        filename: 'par-styles.css'
    }),
    new webpack.DefinePlugin({
        'PUBLICPATH': '"' + publicPath + '"', // from https://webpack.js.org/plugins/define-plugin/: Note that because the plugin does a direct text replacement, the value given to it must include actual quotes inside of the string itself. Typically, this is done either with alternate quotes, such as '"production"', or by using JSON.stringify('production').
        'BUILDTYPE': '"' + process.env.NODE_ENV + '"', 
    }),
];
const svelteUse = [
    {
        loader: 'svelte-loader',
        options: {
            emitCss: true,
            hotReload: true,
            hydratable: true, // here must be true for preprocessing of component to work
            preprocess: {
                style: sass({}, {name: 'scss'})
            }

        }
    }
];

if (!isDev) {
    svelteUse.unshift({
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env']
        }
    });
}

function returnJSUse() {
    if ( isDev ){
        return [{
            loader: 'eslint-loader'
        }];
    } else {
        return [{
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        },
        {
            loader: 'eslint-loader'
        }];
    }
}
const rules = [
    {
        test: /\.svelte$/,
        use: svelteUse
    },

    {
            test: /\.js$|\.mjs$/,
            use: returnJSUse()
        },
        {
            test: /\.css$/,
            use: [
                /**
                 * MiniCssExtractPlugin doesn't support HMR.
                 * For developing, use 'style-loader' instead.
                 * */
                !isDev ? MiniCssExtractPlugin.loader : 'style-loader',
                'css-loader',
            ]
        },
    
    {
        test: /\.scss$/,
        use: [
            /**
             * MiniCssExtractPlugin doesn't support HMR.
             * For developing, use 'style-loader' instead.
             * */
            !isDev ? MiniCssExtractPlugin.loader : 'style-loader',
            {
                loader: 'css-loader',
                options: {
                    modules: {
                        mode: 'local',
                        localIdentName: isDev ? '[path][local]' : '[local]--[hash:base64:5]', // hash to avoid collisions
                    },
                    sourceMap: true,
                    importLoaders: 1
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                    ident: 'postcss',
                    plugins: [
                        require('cssnano'),
                        require('postcss-preset-env')(),
                        require('autoprefixer'),
                    ],
                }
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }
        ]
    },
    {
        test: /\.csv$/,
        loader: 'file-loader',
        options: {
            name: 'data/[name].[ext]?v=[hash:6]', 
        }
    },
    {
        test: /\.html$/,
        exclude: /index.*\.html/,
        use: 'html-loader'
    }
];

if (!isProd) {
    plugins.push(copyWebpack);
}
if (!isDev) {
    rules.unshift({
        test: /\.js$|\.mjs$/,
        use: [{
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
               // plugins: ['@babel/plugin-transform-runtime']
            }
        },
        {
            loader: 'eslint-loader'
        }]
    });
}
if ( isProd ){
    plugins.push(...devToolPlugins);
}
if ( isDev ){
    plugins.push(new webpack.HotModuleReplacementPlugin());
}
if (!isDev) {
    plugins.push(new CleanWebpackPlugin(), prerender);
}
module.exports = () => {
    return {
        devServer: {
            hot: isDev
        },
        devtool: isProd ? false : 'eval-source-map',
        entry: {
            index: ['./src/index.js']
        },
        mode,
        module: {
            rules
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    sourceMap: true,
                    terserOptions: {
                        compress: {
                            drop_console: true,
                        },
                    },
                })
            ]
        },
        output: {
            path: __dirname + '/' + outputFolder,
            filename: '[name].js?v=[hash:6]',
            chunkFilename: '[name].[id].js',
        },
        plugins,
        resolve: {
            alias: {
                svelte: path.resolve('node_modules', 'svelte'),
                "@Submodule": path.resolve('submodules'),
                "@Project": path.resolve('src')
            },
            extensions: ['.mjs', '.js', '.svelte', '.html'],
            mainFields: ['svelte', 'browser', 'module', 'main']
        },
    }
};