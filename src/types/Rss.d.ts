/**
 * Rss route
 */
 export interface RssIRoute {
    /**
     * @TJS-pattern ^[a-zA-Z0-9_.-]*$
     */
    query: 'president' | 'house' | 'senate' | 'lords' | 'commons';
}



