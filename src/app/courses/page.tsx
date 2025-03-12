import CoursesPage from '@/components/Courses/Courses'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <CoursesPage />
  </Suspense>
  )
}

export default page