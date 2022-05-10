

/**
 * TypeAhead / search route
 * Letters and numbers only
 */
export interface NewsIRoute {
    /**
     * @TJS-pattern ^[a-zA-Z0-9_.-]*$
     */
    query: 'president' | 'house' | 'senate' | 'lords' | 'commons';
}



