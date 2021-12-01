const MIN_LENGTH = {
    pattern: /\w{4,}/,
    errorMessage: 'Field should have more than 4 chars', 
}

const MAX_LENGTH = {
    pattern: /^\w{0,8}$/,
    errorMessage: 'Field should have less than 8 chars', 
}

const ONE_DIGIT = {
    pattern: /\d{1,}/,
    errorMessage: 'Field must contain at least one digit', 
}

export {
    MIN_LENGTH,
    MAX_LENGTH,
    ONE_DIGIT,
}