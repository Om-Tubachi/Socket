export const getWords = async (settings) => {
    if(!settings) {
        console.log('Settings missing');
        return
    }

    const { custom, customWords } = settings
    if(custom) {
        return [customWords[0]]
    }
    else {
        return ['Apple', 'Comb', 'Watch']
    }
}