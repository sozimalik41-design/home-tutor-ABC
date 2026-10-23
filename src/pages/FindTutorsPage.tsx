import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  RotateCcw, 
  MapPin, 
  Calendar,
  X
} from 'lucide-react';
import { TUTORS_LIST, POPULAR_SUBJECTS, CITIES, CLASSES_LEVELS } from '../data/mockData';
import { TutorCard } from '../components/common/TutorCard';
import { PhaseNotice } from '../components/common/PhaseNotice';
import { tutorService } from '../services/tutorService';
import { Tutor } from '../types';

export const FindTutorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tutors data state from service
  const [tutorsList, setTutorsList] = useState<Tutor[]>(TUTORS_LIST);

  // Initial states from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female' | 'Prefer not to say'>(
    (searchParams.get('gender') as any) || 'All'
  );
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'All Subjects');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classLevel') || 'All Classes');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All Cities');
  const [selectedMode, setSelectedMode] = useState<'All' | 'In-Person' | 'Online'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price-asc' | 'price-desc'>('rating');

  useEffect(() => {
    tutorService.getTutors().then(res => {
      if (res.tutors && res.tutors.length > 0) {
        setTutorsList(res.tutors);
      }
    });
  }, []);

  // Sync state if URL changes
  useEffect(() => {
    if (searchParams.get('subject')) setSelectedSubject(searchParams.get('subject')!);
    if (searchParams.get('classLevel')) setSelectedClass(searchParams.get('classLevel')!);
    if (searchParams.get('city')) setSelectedCity(searchParams.get('city')!);
  }, [searchParams]);

  // Filtering logic
  const filteredTutors = useMemo(() => {
    return tutorsList.filter((tutor) => {
      // Keyword search (name, bio, university, subjects, teachingArea)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tutor.name.toLowerCase().includes(query);
        const matchesBio = tutor.bio.toLowerCase().includes(query);
        const matchesUni = tutor.university.toLowerCase().includes(query);
        const matchesSubj = tutor.subjects.some(s => s.toLowerCase().includes(query));
        const matchesArea = tutor.teachingArea && tutor.teachingArea.toLowerCase().includes(query);
        if (!matchesName && !matchesBio && !matchesUni && !matchesSubj && !matchesArea) return false;
      }

      // Gender filter
      if (selectedGender && selectedGender !== 'All') {
        if (tutor.gender !== selectedGender) return false;
      }

      // Subject filter
      if (selectedSubject && selectedSubject !== 'All Subjects') {
        const hasSubject = tutor.subjects.some(s => 
          s.toLowerCase().includes(selectedSubject.toLowerCase()) || 
          selectedSubject.toLowerCase().includes(s.toLowerCase())
        );
        if (!hasSubject) return false;
      }

      // Class level filter
      if (selectedClass && selectedClass !== 'All Classes') {
        const hasClass = tutor.classes.some(c => c.toLowerCase().includes(selectedClass.toLowerCase()));
        if (!hasClass) return false;
      }

      // City filter
      if (selectedCity && selectedCity !== 'All Cities') {
        const hasCity = tutor.cities.includes(selectedCity) || tutor.cities.includes('Online Only');
        if (!hasCity) return false;
      }

      // Teaching mode
      if (selectedMode !== 'All') {
        if (!tutor.mode.includes(selectedMode) && !tutor.mode.includes('Hybrid')) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'price-asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price-desc') return b.hourlyRate - a.hourlyRate;
      return 0;
    });
  }, [tutorsList, searchQuery, selectedGender, selectedSubject, selectedClass, selectedCity, selectedMode, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGender('All');
    setSelectedSubject('All Subjects');
    setSelectedClass('All Classes');
    setSelectedCity('All Cities');
    setSelectedMode('All');
    setSortBy('rating');
    setSearchParams({});
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedGender !== 'All' ||
    selectedSubject !== 'All Subjects' || 
    selectedClass !== 'All Classes' || 
    selectedCity !== 'All Cities' || 
    selectedMode !== 'All';

  return (
    <div className="min-h-screen bg-[#F5F3FF] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-2">
              <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#4C1D95]">Find Tutors</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Verified Home Tutors Directory
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Browse qualified teachers for home visits and online sessions. Zero agent markup.
            </p>
          </div>

          <Link
            to="/book-appointment"
            className="self-start md:self-auto px-4 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#A78BFA]" />
            <span>Book Direct Appointment</span>
          </Link>
        </div>

        {/* Notice */}
        <PhaseNotice
          title="Tutor Matching Directory (Lavender Dream Edition)"
          description="Instant filter engine with multi-criteria subject, class, city, gender, and mode selection. Responsive design with high-contrast readable typography."
        />

        {/* Filter Toolbar Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#DDD6FE] shadow-xs space-y-5">
          
          {/* Top Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#A78BFA] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tutor name, subject (e.g. Calculus, Physics, O-Levels), or university..."
              className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl pl-12 pr-10 py-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#4C1D95]"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Criteria Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            
            {/* Subject */}
            <div>
              <label htmlFor="filter-subject" className="block text-xs font-semibold text-[#1F2937] mb-1">
                Subject
              </label>
              <select
                id="filter-subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
              >
                <option value="All Subjects">All Subjects</option>
                {POPULAR_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Class Level */}
            <div>
              <label htmlFor="filter-class" className="block text-xs font-semibold text-[#1F2937] mb-1">
                Class / Grade Level
              </label>
              <select
                id="filter-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
              >
                {CLASSES_LEVELS.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label htmlFor="filter-city" className="block text-xs font-semibold text-[#1F2937] mb-1">
                City / Coverage
              </label>
              <select
                id="filter-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
              >
                {CITIES.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="filter-sort" className="block text-xs font-semibold text-[#1F2937] mb-1">
                Sort Results
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
              >
                <option value="rating">Highest Rated (Default)</option>
                <option value="experience">Most Experienced</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Mode & Gender Pill Selectors + Reset Action */}
          <div className="pt-3 border-t border-[#DDD6FE]/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Teaching Mode */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#6B7280] mr-1">Teaching Mode:</span>
                {(['All', 'In-Person', 'Online'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      selectedMode === mode
                        ? 'bg-[#4C1D95] text-white border-[#4C1D95] shadow-2xs'
                        : 'bg-[#F5F3FF] text-[#1F2937] border-[#DDD6FE] hover:bg-[#DDD6FE]/40'
                    }`}
                  >
                    {mode === 'In-Person' ? 'In-Home Visit' : mode}
                  </button>
                ))}
              </div>

              {/* Tutor Gender Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#6B7280] mr-1">Tutor Gender:</span>
                {(['All', 'Female', 'Male', 'Prefer not to say'] as const).map((genderOption) => (
                  <button
                    key={genderOption}
                    type="button"
                    onClick={() => setSelectedGender(genderOption as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      selectedGender === genderOption
                        ? 'bg-[#A78BFA] text-[#3B0764] font-bold border-[#A78BFA] shadow-2xs'
                        : 'bg-[#F5F3FF] text-[#1F2937] border-[#DDD6FE] hover:bg-[#DDD6FE]/40'
                    }`}
                  >
                    {genderOption === 'All' ? 'All Genders' : genderOption === 'Prefer not to say' ? 'All / Unspecified' : `${genderOption} Tutors`}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>

        </div>

        {/* Results Count & Active Status */}
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <div>
            Showing <span className="font-bold text-[#4C1D95] tabular-nums">{filteredTutors.length}</span> verified educators
          </div>
          {selectedCity !== 'All Cities' && (
            <div className="flex items-center gap-1 text-[#4C1D95]">
              <MapPin className="w-3.5 h-3.5 text-[#4C1D95]" />
              <span>Location: {selectedCity}</span>
            </div>
          )}
        </div>

        {/* Grid of Tutors or Empty State */}
        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#DDD6FE] space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] text-[#4C1D95] flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">
              No tutors match your search criteria
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              We couldn't find any educators matching your specific combination of subject, city, and grade. Try broadening your filter selections.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#4C1D95] text-white rounded-xl text-xs font-bold hover:bg-[#3B0764] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
