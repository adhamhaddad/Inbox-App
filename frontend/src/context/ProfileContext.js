import React, { createContext, useState, useEffect } from 'react'
import { useAuth, useApi } from 'src/hooks'

const ProfileContext = createContext({
  profile: { id: null, image_url: null },
  loading: false,
  handleUpload: data => {},
  handleDelete: () => {}
})

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({ id: null, image_url: null })
  const { user } = useAuth()
  const { get, post, deleteFunc, loading } = useApi()

  const getProfilePicture = async () => {
    try {
      const response = await get(`/profile-pictures/${user.id}`)
      setProfile(response.data)
    } catch (error) {
      console.log(error)
    }
  }
  const createProfilePicture = async (data, cb) => {
    if (!data) {
      return
    }
    try {
      const formData = new FormData()
      formData.append('image_url', data)
      formData.append('user_id', user.id)
      const response = await post('/profile-pictures', formData)
      setProfile(response.data)
    } catch (error) {
      console.error(error)
    }
  }
  const deleteProfilePicture = async () => {
    try {
      const response = await deleteFunc(`/profile-pictures/${user.id}`)
      setProfile(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getProfilePicture()
  }, [])

  const values = {
    profile,
    loading,
    handleUpload: createProfilePicture,
    handleDelete: deleteProfilePicture
  }
  return <ProfileContext.Provider value={values}>{children}</ProfileContext.Provider>
}
export { ProfileContext, ProfileProvider }
