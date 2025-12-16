export const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} km`
}

export const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
}

export const formatPace = (pace: number) => {
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
}