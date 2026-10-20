import torch.nn as nn


class ANN(nn.Module):
    def __init__(self, features: int, no_of_rep: int, expands: int, drp_rate: float):
        super().__init__()
        layers: list[nn.Module] = [nn.Linear(features, expands), nn.BatchNorm1d(expands), nn.ReLU()]
        reduction = expands // 4
        while (expands - reduction) >= 4:
            for _ in range(no_of_rep):
                layers.extend([nn.Linear(expands, expands), nn.BatchNorm1d(expands), nn.ReLU(), nn.Dropout(drp_rate)])
            layers.append(nn.Linear(expands, expands - reduction))
            expands -= reduction
        layers.extend([nn.Linear(expands, 1), nn.Sigmoid()])
        self.seq = nn.Sequential(*layers)

    def forward(self, features):
        return self.seq(features)
