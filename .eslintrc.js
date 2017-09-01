module.exports = {
    extends: 'airbnb-base',
    rules: {
        'import/newline-after-import': 0,
        'consistent-return': 0,
        'eol-last': 1,
        'func-names': 0,
        'key-spacing': 0,
        'max-len': [2, { code: 200, comments: 100, ignoreStrings: true, ignoreTemplateLiterals: true }],
        'max-lines': [1, { max: 4000, skipBlankLines: true, skipComments: true }],
        'no-else-return': 0,
        'no-loop-func': 1,
        'no-path-concat': 1,
        'no-shadow': 1,
        'no-trailing-spaces': 0,
        'no-undef': 0,
        'no-unused-vars': [2, { vars: 'all', args: 'none' }],
        'no-var': 0,
        'no-multiple-empty-lines': 2,
        'no-multi-spaces': 0,
        'no-use-before-define': [2, { functions: false, classes: false, variables: true }],
        'no-param-reassign': 1,
        'no-plusplus': 0,
        'no-useless-escape': 1,
        'prefer-arrow-callback': 0,
        'object-shorthand': 0,
        'object-curly-spacing': [2, 'always'],
        'prefer-const': 0,
        'prefer-template': 0,
        'padded-blocks': 0,
        'arrow-body-style': 0,
        'space-before-function-paren': [2, { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
        'spaced-comment': 2,
        'strict': 0,
        'global-require': 0,
        'operator-assignment': 0,
        indent: [2, 4, { SwitchCase: 1 }],
        'comma-dangle': 0
    }
};