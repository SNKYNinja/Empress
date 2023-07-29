function trimSentence(str: string, maxLength: number) {
    if (str.length < maxLength) return str;
    let trimmedString = str.substr(0, maxLength);
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')));
    return trimmedString + ' ...';
}

export { trimSentence };
