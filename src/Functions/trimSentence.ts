function trimSentence(str: string, maxLength: number) {
    if (str.length <= maxLength) {
        return str;
    }

    let trimmedString = str.slice(0, maxLength);

    if (trimmedString.lastIndexOf(' ') !== -1) {
        trimmedString = trimmedString.slice(0, trimmedString.lastIndexOf(' '));
    }

    return trimmedString + ' ...';
}

export { trimSentence };
