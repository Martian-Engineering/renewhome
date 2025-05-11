// Debug script to analyze slide data
import { getSortedSlidesData } from './lib/slides.js'; const slides = getSortedSlidesData(); console.log(slides.map(s => ({ sectionId: s.sectionId, sectionNumber: s.sectionNumber, slideNumber: s.slideNumber, id: s.id }))); console.log('Unique sections:', new Set(slides.map(s => s.sectionId)));
