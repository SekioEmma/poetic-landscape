// Offsets only: content.ts remains the sole original-text source.
// Reviewed line boundaries include source punctuation, never comma inference.
export type ReadingForm='quatrain'|'regulated'|'song'|'ancient'|'prose';
export type ReadingLayout={form:ReadingForm;paragraphs:Record<string,number[]>};
export const readingLayouts:Record<string,ReadingLayout>={
 'huxinting-kanxue':{form:'prose',paragraphs:{p1:[],p2:[],p3:[],p4:[]}},
 'huanghelou':{form:'regulated',paragraphs:{p1:[0,8,16],p2:[0,8,16],p3:[0,8,16],p4:[0,8,16]}},
 'song-menghaoran':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}},
 'maowu':{form:'song',paragraphs:{p1:[0,8,16,24,32,40],p2:[0,10,18,26,34,42],p3:[0,8,16,24,32,40,48,56,64],p4:[0,8,18,26,39,49]}},
 'yin-hushang':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}},
 'qiantang-chunxing':{form:'regulated',paragraphs:{p1:[0,8,16],p2:[0,8,16],p3:[0,8,16],p4:[0,8,16]}},
 'fengqiao-yebo':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}},
 'bochuan-guazhou':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}},
 'liangzhouci-1':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}},
 'guanshanyue':{form:'ancient',paragraphs:{p1:[0,6,12],p2:[0,6,12],p3:[0,6,12],p4:[0,6,12],p5:[0,6,12],p6:[0,6,12]}},
 'song-yuaner':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}},
 'congjunxing-4':{form:'quatrain',paragraphs:{p1:[0,8,16],p2:[0,8,16]}}
};
