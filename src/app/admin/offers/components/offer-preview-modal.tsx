import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { closePreview } from "@/lib/slices/offersSlice";
import { selectRootState } from "@/lib/store";
import { useFetchCourcesQuery } from "@/services/api";

export default function OfferPreviewModal() {
  const dispatch = useDispatch();
  const offer = useSelector((state) => selectRootState(state).offers);
  const { previewOffer, isPreviewOpen } = offer;
  const { data: coursesData } = useFetchCourcesQuery({});
  const courses = coursesData?.data || [];

  const handleClose = () => {
    dispatch(closePreview());
  };
  
  if (!previewOffer) return null;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate if offer is active
  const isActive = () => {
    const now = new Date();
    const validFrom = new Date(previewOffer.validFrom);
    const validUntil = new Date(previewOffer.validUntil);
    return now >= validFrom && now <= validUntil;
  };

  // Get course details for the applied courses
  const getAppliedCourses = () => {
    if (!previewOffer.courses || !courses) return [];
    return previewOffer.courses.map(courseId => {
      const course = courses.find(c => c._id === (typeof courseId === 'object' ? courseId._id : courseId));
      return course || null;
    }).filter(Boolean);
  };

  const appliedCourses = getAppliedCourses();

  return (
    <Dialog open={isPreviewOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Offer Preview
            <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
              isActive() 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {isActive() ? "Active" : "Inactive"}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
              {previewOffer.code}
            </h3>
            
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-gray-500 dark:text-gray-400">Discount:</div>
              <div className="font-medium">{previewOffer.discountPercentage}%</div>
              
              <div className="text-gray-500 dark:text-gray-400">Valid From:</div>
              <div className="font-medium">{formatDate(previewOffer.validFrom)}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Valid Until:</div>
              <div className="font-medium">{formatDate(previewOffer.validUntil)}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Status:</div>
              <div className="font-medium">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive() 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {isActive() ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Applied to Courses:</h4>
            {appliedCourses.length > 0 ? (
              <ul className="space-y-1 pl-5 list-disc text-sm text-gray-600 dark:text-gray-400">
                {appliedCourses.map((course) => (
                  <li key={course._id}>{course.courseName}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No courses assigned</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 