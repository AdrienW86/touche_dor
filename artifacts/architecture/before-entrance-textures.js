/* Non-repeating, aligned PBR maps for the exterior stone only (Three.js r128). */
(function () {
  let cached;
  window.createEntranceStone = function (T) {
    if (cached) return cached;
    const size = 1024, count = size * size;
    let seed = 734167;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const canvas = () => {
      const result = document.createElement('canvas');
      result.width = result.height = size;
      return result;
    };
    const colorCanvas = canvas(), maskCanvas = canvas();
    const colorContext = colorCanvas.getContext('2d');
    const maskContext = maskCanvas.getContext('2d');
    const grids = [5, 15, 43, 125].map(side => ({
      side, values: Float32Array.from({ length: (side + 1) ** 2 }, random)
    }));
    const noise = (u, v, grid) => {
      const x = u * grid.side, y = v * grid.side;
      const ix = Math.floor(x), iy = Math.floor(y), stride = grid.side + 1;
      let fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const p = iy * stride + ix, data = grid.values;
      return (data[p] * (1 - fx) + data[p + 1] * fx) * (1 - fy)
        + (data[p + stride] * (1 - fx) + data[p + stride + 1] * fx) * fy;
    };

    // Faults follow different geological directions, with displaced subdivisions.
    // Separate branches and broken hairlines avoid a continuous striped pattern.
    const faults = [];
    function fracture(x, y, angle, length, width, strength, branches) {
      const steps = Math.max(6, Math.round(length / 5));
      const points = [[x, y]];
      let heading = angle;
      for (let i = 0; i < steps; i++) {
        heading += (random() - .5) * .42;
        if (random() < .09) heading += (random() - .5) * 1.15;
        const distance = length / steps * (.55 + random() * .9);
        x += Math.cos(heading) * distance;
        y += Math.sin(heading) * distance;
        points.push([x + (random() - .5) * 1.8, y + (random() - .5) * 1.8]);
        if (branches && i > 1 && i < steps - 2 && random() < .16) {
          fracture(x, y, heading + (random() < .5 ? -1 : 1) * (.45 + random()),
            length * (.08 + random() * .2), width * .42, strength * .65, false);
        }
      }
      faults.push({ points, width, strength });
    }
    [
      [-70, 125, .43, 700, 1.5], [340, -30, 1.05, 650, 1.1],
      [1060, 180, 2.35, 620, 1.65], [830, 1060, -2.25, 600, 1.2],
      [10, 690, -.38, 540, .85], [520, 740, -.8, 370, 1.4],
      [1120, 690, -2.8, 470, .75]
    ].forEach(a => {
      a[4] *= .65;
      fracture(...a, .46 + random() * .2, true);
    });
    for (let i = 0; i < 30; i++) {
      fracture(random() * size, random() * size, random() * Math.PI * 2,
        45 + random() * 175, .4 + random() * .6, .45 + random() * .4, true);
    }
    for (let i = 0; i < 180; i++) {
      fracture(random() * size, random() * size, random() * Math.PI * 2,
        15 + random() * 85, .35 + random() * .5, .3 + random() * .5, i % 3 === 0);
    }
    maskContext.fillStyle = '#000';
    maskContext.fillRect(0, 0, size, size);
    maskContext.lineCap = 'round'; maskContext.lineJoin = 'round';
    for (const fault of faults) {
      // Wider, very faint mineral edges surround the narrow copper seam.
      [[4.6, .09], [1.8, .21], [.62, .82]].forEach(([scale, opacity]) => {
        for (let i = 0; i < fault.points.length - 1; i++) {
          const a = fault.points[i], b = fault.points[i + 1];
          maskContext.strokeStyle = 'rgba(255,255,255,'
            + opacity * fault.strength * (.35 + random() * .65) + ')';
          maskContext.lineWidth = Math.max(.22, fault.width * scale * (.55 + random()));
          maskContext.beginPath(); maskContext.moveTo(a[0], a[1]);
          maskContext.lineTo(b[0], b[1]); maskContext.stroke();
        }
      });
    }

    const mineral = maskContext.getImageData(0, 0, size, size).data;
    const colors = colorContext.createImageData(size, size);
    const roughCanvas = canvas(), normalCanvas = canvas();
    const roughContext = roughCanvas.getContext('2d');
    const normalContext = normalCanvas.getContext('2d');
    const rough = roughContext.createImageData(size, size);
    const normals = normalContext.createImageData(size, size);
    const height = new Float32Array(count);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = y * size + x, p = index * 4, u = x / size, v = y / size;
        const cloud = noise(u, v, grids[0]) * .5 + noise(u, v, grids[1]) * .3
          + noise(u, v, grids[2]) * .15 + noise(u, v, grids[3]) * .05;
        const grain = (random() - .5) * 1.8;
        const seam = mineral[p] / 255;
        const warmth = .7 + noise(u, v, grids[2]) * .6;
        const base = 5.8 + cloud ** 1.6 * 13 + grain;
        colors.data[p] = base + seam * 151 * warmth;
        colors.data[p + 1] = base * .98 + seam * 101 * warmth;
        colors.data[p + 2] = base * 1.04 + seam * 49 * warmth;
        colors.data[p + 3] = 255;
        const r = 65 + cloud * 17 - seam * 20 + grain;
        rough.data[p] = rough.data[p + 1] = rough.data[p + 2] = r;
        rough.data[p + 3] = 255;
        height[index] = seam * .25 + cloud * .075 + grain * .0015;
      }
    }
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = y * size + x, p = index * 4;
        const dx = height[y * size + Math.min(size - 1, x + 1)]
          - height[y * size + Math.max(0, x - 1)];
        const dy = height[Math.min(size - 1, y + 1) * size + x]
          - height[Math.max(0, y - 1) * size + x];
        const length = Math.sqrt(dx * dx + dy * dy + 1);
        normals.data[p] = 128 - dx / length * 127;
        normals.data[p + 1] = 128 + dy / length * 127;
        normals.data[p + 2] = 128 + 127 / length;
        normals.data[p + 3] = 255;
      }
    }
    colorContext.putImageData(colors, 0, 0);
    roughContext.putImageData(rough, 0, 0);
    normalContext.putImageData(normals, 0, 0);
    const texture = (source, isColor) => {
      const map = new T.CanvasTexture(source);
      map.wrapS = map.wrapT = T.ClampToEdgeWrapping;
      map.anisotropy = 8;
      map.encoding = isColor ? T.sRGBEncoding : T.LinearEncoding;
      return map;
    };
    cached = {
      color: texture(colorCanvas, true),
      roughness: texture(roughCanvas, false),
      normal: texture(normalCanvas, false)
    };
    return cached;
  };
})();
