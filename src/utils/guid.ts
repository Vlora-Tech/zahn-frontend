export const guid = (id?: string): string => {
    if (id) return id
    const head: string = Date.now().toString(36)
    const tail: string = Math.random().toString(36).substring(2)
    return head + tail
}
